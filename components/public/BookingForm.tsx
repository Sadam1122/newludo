"use client";

import { useEffect, useMemo, useState } from "react";
import { BookingEvent, EventPackage, EventTable } from "@prisma/client";
import { AlertTriangle, Check, Minus, Plus } from "lucide-react";
import { DELIVERY_CATEGORIES, DeliveryCategoryKey } from "@/lib/deliveryCategories";
import { computeOrderTotals } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { SeatMap } from "./SeatMap";

type BookingEventWithRelations = BookingEvent & {
  packages: EventPackage[];
  tables: EventTable[];
};

type Props = {
  event: BookingEventWithRelations;
  alaCarteMenu?: EventPackage[];
};

export function BookingForm({ event, alaCarteMenu = [] }: Props) {
  const [selectedTable, setSelectedTable] = useState<EventTable | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<EventPackage | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState<DeliveryCategoryKey | null>(null);
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [memberUsername, setMemberUsername] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [alaCarteCart, setAlaCarteCart] = useState<Record<string, number>>({});
  const [seatQuantity, setSeatQuantity] = useState(1);
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!holdExpiresAt) return;

    const tick = () => {
      const diff = Math.max(0, Math.round((holdExpiresAt - Date.now()) / 1000));
      setRemainingSeconds(diff);
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [holdExpiresAt]);

  const isDeliveryOrder = event.eventType === "DELIVERY_ORDER";
  const isSeatBased = event.eventType === "NOBAR_COMMUNITY";
  const showAlaCarte = !isDeliveryOrder && event.allowAlaCarte && alaCarteMenu.length > 0;
  // If the event has no tables, it might be a general admission event
  const hasTables = event.tables.length > 0;
  const remainingSeats = selectedTable ? selectedTable.capacity - selectedTable.bookedSeats : 0;

  // Packages matching the selected table / category filter
  const matchingPackages = selectedTable
    ? event.packages.filter((pkg) => pkg.tableType === selectedTable.tableType)
    : isDeliveryOrder
      ? event.packages.filter(
          (pkg) =>
            (!category || pkg.category === category) &&
            (!subCategory || pkg.subCategory === subCategory),
        )
      : event.packages;

  const handleTableSelect = (table: EventTable) => {
    setSelectedTable(table);
    setSeatQuantity(1);

    if (isSeatBased) {
      // NOBAR_COMMUNITY: seats must be chosen first, package is picked as its own
      // explicit step afterwards — never auto-select it here.
      setSelectedPackage(null);
      return;
    }

    // Reset package selection when table changes, unless there's only 1 matching package
    const pkgs = event.packages.filter((p) => p.tableType === table.tableType);
    if (pkgs.length === 1) {
      setSelectedPackage(pkgs[0]);
    } else {
      setSelectedPackage(null);
    }
  };

  const handleCategorySelect = (next: DeliveryCategoryKey | null) => {
    setCategory(next);
    setSubCategory(null);
    setSelectedPackage(null);
  };

  const adjustAlaCarteQty = (packageId: string, delta: number) => {
    setAlaCarteCart((current) => {
      const nextQty = Math.max(0, (current[packageId] ?? 0) + delta);
      const next = { ...current };
      if (nextQty === 0) {
        delete next[packageId];
      } else {
        next[packageId] = nextQty;
      }
      return next;
    });
  };

  const alaCarteLines = Object.entries(alaCarteCart)
    .map(([packageId, qty]) => ({
      pkg: alaCarteMenu.find((p) => p.id === packageId),
      qty,
    }))
    .filter((line) => line.pkg);

  const packageSubtotal = selectedPackage
    ? selectedPackage.price * (isSeatBased ? seatQuantity : hasTables ? 1 : quantity)
    : 0;
  const alaCarteSubtotal = alaCarteLines.reduce((sum, line) => sum + (line.pkg!.price * line.qty), 0);
  const subtotal = packageSubtotal + alaCarteSubtotal;
  const totals = useMemo(() => computeOrderTotals(subtotal, 0), [subtotal]);

  const minimumCharge = selectedTable?.basePrice ?? 0;
  const meetsMinimum = minimumCharge === 0 || subtotal >= minimumCharge;

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (hasTables && !selectedTable) return alert("Please select a table first");
    if (!selectedPackage) return alert("Please select a package");
    if (isSeatBased && (seatQuantity < 1 || seatQuantity > remainingSeats)) {
      return alert(`Please select between 1 and ${remainingSeats} seat(s) on this table.`);
    }
    if (!meetsMinimum) {
      return alert(`Minimum charge for table ${selectedTable?.tableCode} is IDR ${minimumCharge.toLocaleString()}. Please add more items.`);
    }
    if (isMember && (!memberUsername || !memberPassword)) {
      return alert("Please enter your member username and password, or switch the member question back to No.");
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const customerData = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      request: formData.get("request"),
    };

    try {
      const res = await fetch("/api/midtrans/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          packageId: selectedPackage.id,
          tableId: selectedTable?.id || null,
          quantity: isSeatBased ? seatQuantity : hasTables ? 1 : quantity,
          customer: customerData,
          member: isMember ? { username: memberUsername, password: memberPassword } : null,
          alaCarteItems: alaCarteLines.map((line) => ({ packageId: line.pkg!.id, quantity: line.qty })),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Checkout failed");

      if (data.expiredAt) {
        setHoldExpiresAt(new Date(data.expiredAt).getTime());
      }

      // Load snap script and trigger popup
      if (typeof window !== "undefined" && (window as any).snap) {
        (window as any).snap.pay(data.snapToken, {
          onSuccess: function (result: any) {
            window.location.href = `/book/success?order_id=${data.orderId}`;
          },
          onPending: function (result: any) {
            window.location.href = `/book/success?order_id=${data.orderId}`;
          },
          onError: function (result: any) {
            alert("Payment failed!");
            window.location.reload();
          },
          onClose: function () {
            alert("You closed the popup. The table will be reserved for 15 minutes.");
          }
        });
      } else {
        alert("Midtrans snap script is not loaded properly.");
      }

    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleCheckout} className="space-y-10">
      {/* 1. Seat Selection (If event has tables) */}
      {hasTables && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">1. Select Your Table</h2>
            {selectedTable && (
              <span className="rounded-full bg-ludo-gold px-3 py-1 text-xs font-bold text-black">
                Table {selectedTable.tableCode} Selected
              </span>
            )}
          </div>
          <SeatMap
            tables={event.tables}
            selectedTable={selectedTable}
            onSelectTable={handleTableSelect}
            perSeat={isSeatBased}
          />
          {selectedTable && selectedTable.basePrice > 0 && (
            <p className="mt-3 rounded-lg border border-ludo-gold/30 bg-ludo-gold/10 px-4 py-2 text-xs font-bold text-ludo-gold">
              Minimum charge for {selectedTable.tableCode}: IDR {selectedTable.basePrice.toLocaleString()}
            </p>
          )}
          {isSeatBased && selectedTable && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4">
              <div>
                <p className="text-sm font-bold text-white">How many seats?</p>
                <p className="text-xs text-zinc-400">{remainingSeats} seat(s) left on {selectedTable.tableCode}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSeatQuantity((q) => Math.max(1, q - 1))}
                  disabled={seatQuantity <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white disabled:opacity-30"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-6 text-center text-lg font-bold text-white">{seatQuantity}</span>
                <button
                  type="button"
                  onClick={() => setSeatQuantity((q) => Math.min(remainingSeats, q + 1))}
                  disabled={seatQuantity >= remainingSeats}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white hover:border-ludo-gold disabled:opacity-30"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Category filter (Delivery Order only) */}
      {isDeliveryOrder && !hasTables && (
        <section>
          <h2 className="mb-4 text-xl font-bold text-white">1. Browse Menu</h2>
          <div className="flex flex-wrap gap-2">
            <FilterChip active={category === null} onClick={() => handleCategorySelect(null)}>
              All
            </FilterChip>
            {Object.entries(DELIVERY_CATEGORIES).map(([key, value]) => (
              <FilterChip
                key={key}
                active={category === key}
                onClick={() => handleCategorySelect(key as DeliveryCategoryKey)}
              >
                {value.label}
              </FilterChip>
            ))}
          </div>

          {category && (
            <div className="mt-3 flex flex-wrap gap-2">
              <FilterChip active={subCategory === null} onClick={() => setSubCategory(null)} small>
                All {DELIVERY_CATEGORIES[category].label}
              </FilterChip>
              {DELIVERY_CATEGORIES[category].subCategories.map((sub) => (
                <FilterChip
                  key={sub}
                  active={subCategory === sub}
                  onClick={() => setSubCategory(sub)}
                  small
                >
                  {sub}
                </FilterChip>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 2. Package Selection */}
      {(!hasTables || selectedTable) && (
        <section className="animate-in fade-in slide-in-from-bottom-4">
          <h2 className="mb-4 text-xl font-bold text-white">
            {hasTables ? "2. Select Package" : isDeliveryOrder ? "2. Select Menu" : "1. Select Package"}
          </h2>

          {matchingPackages.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/15 bg-black/20 p-8 text-center">
              <AlertTriangle className="size-8 text-ludo-gold" />
              <p className="font-bold text-white">
                {selectedTable
                  ? `No packages available yet for ${selectedTable.tableType.replace(/_/g, " ")}.`
                  : "No packages available for this selection."}
              </p>
              <p className="max-w-sm text-sm text-zinc-400">
                This table type does not have a package configured yet. Please pick another table,
                or contact us on WhatsApp and our team will help you complete this booking directly.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {matchingPackages.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;
                return (
                  <button
                    type="button"
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={cn(
                      "relative flex flex-col items-start overflow-hidden rounded-xl border text-left transition-all",
                      isSelected
                        ? "border-ludo-gold bg-ludo-gold/10 shadow-[0_0_20px_rgba(247,198,0,0.15)]"
                        : "border-white/10 bg-black/20 hover:border-white/30"
                    )}
                  >
                    {pkg.posterImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pkg.posterImage}
                        alt={pkg.name}
                        className="h-auto w-full"
                      />
                    )}
                    <div className="flex w-full flex-col p-5">
                      <div className="flex w-full items-start justify-between">
                        <div>
                          <h3 className="font-bold text-white">{pkg.name}</h3>
                          <p className="text-sm text-zinc-400">
                            {isDeliveryOrder
                              ? [pkg.category, pkg.subCategory].filter(Boolean).join(" • ")
                              : pkg.tableType.replace(/_/g, " ")}
                          </p>
                          {pkg.description && (
                            <p className="mt-1 text-xs text-zinc-500">{pkg.description}</p>
                          )}
                        </div>
                        {isSelected && (
                          <div className="rounded-full bg-ludo-gold p-1 text-black">
                            <Check className="size-3" />
                          </div>
                        )}
                      </div>
                      <p className="mt-4 text-lg font-black text-ludo-gold">
                        IDR {pkg.price.toLocaleString()}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Quantity for non-table events */}
      {!hasTables && selectedPackage && (
        <section className="animate-in fade-in slide-in-from-bottom-4">
          <h2 className="mb-4 text-xl font-bold text-white">
            {isDeliveryOrder ? "3. Quantity" : "2. Quantity"}
          </h2>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="h-12 w-full rounded border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-ludo-gold"
          />
        </section>
      )}

      {/* À La Carte Add-on Menu (Booking Events only, when enabled) */}
      {showAlaCarte && selectedPackage && (
        <section className="animate-in fade-in slide-in-from-bottom-4">
          <h2 className="mb-4 text-xl font-bold text-white">Add Menu Items (Optional)</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {alaCarteMenu.map((item) => {
              const qty = alaCarteCart[item.id] ?? 0;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-white">{item.name}</p>
                    <p className="text-xs text-zinc-400">
                      {[item.category, item.subCategory].filter(Boolean).join(" • ")}
                    </p>
                    <p className="mt-1 text-sm font-black text-ludo-gold">
                      IDR {item.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustAlaCarteQty(item.id, -1)}
                      disabled={qty === 0}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white disabled:opacity-30"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-5 text-center text-sm font-bold text-white">{qty}</span>
                    <button
                      type="button"
                      onClick={() => adjustAlaCarteQty(item.id, 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white hover:border-ludo-gold"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Customer Details & Checkout */}
      {selectedPackage && (
        <section className="animate-in fade-in slide-in-from-bottom-4 space-y-4">
          <h2 className="mb-4 text-xl font-bold text-white">Customer Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              name="name"
              required
              placeholder="Full Name"
              className="h-12 w-full rounded border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-ludo-gold"
            />
            <input
              type="tel"
              name="phone"
              required
              placeholder="Phone Number (WhatsApp)"
              className="h-12 w-full rounded border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-ludo-gold"
            />
            <input
              type="email"
              name="email"
              required
              placeholder="Email Address"
              className="h-12 w-full sm:col-span-2 rounded border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-ludo-gold"
            />
            <textarea
              name="request"
              placeholder="Special Requests (Optional)"
              className="min-h-[100px] w-full sm:col-span-2 rounded border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-ludo-gold"
            />
          </div>

          {/* Member question */}
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold text-white">Apakah Anda member?</p>
              <div className="flex overflow-hidden rounded-full border border-white/15">
                <button
                  type="button"
                  onClick={() => setIsMember(false)}
                  className={cn(
                    "h-9 px-4 text-xs font-black uppercase transition",
                    !isMember ? "bg-ludo-gold text-black" : "text-zinc-400 hover:text-white",
                  )}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => setIsMember(true)}
                  className={cn(
                    "h-9 px-4 text-xs font-black uppercase transition",
                    isMember ? "bg-ludo-gold text-black" : "text-zinc-400 hover:text-white",
                  )}
                >
                  Yes
                </button>
              </div>
            </div>

            {isMember && (
              <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={memberUsername}
                    onChange={(e) => setMemberUsername(e.target.value)}
                    placeholder="Member Username"
                    className="h-11 w-full rounded border border-white/10 bg-black/30 px-3 text-white outline-none focus:border-ludo-gold"
                    required={isMember}
                  />
                  <input
                    type="password"
                    value={memberPassword}
                    onChange={(e) => setMemberPassword(e.target.value)}
                    placeholder="Member Password"
                    className="h-11 w-full rounded border border-white/10 bg-black/30 px-3 text-white outline-none focus:border-ludo-gold"
                    required={isMember}
                  />
                </div>
                <p className="text-xs leading-relaxed text-zinc-400">
                  Benefit member: dapatkan diskon khusus sesuai akun member Anda. Diskon akan otomatis
                  diterapkan ke Total Belanja setelah username &amp; password berhasil diverifikasi saat pembayaran.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 rounded-xl bg-ludo-gold/10 p-6">
            <div className="mb-4 flex flex-col gap-2 border-b border-ludo-gold/20 pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Selected {isDeliveryOrder ? "Menu" : "Package"}</span>
                <span className="font-bold text-white">{selectedPackage.name}</span>
              </div>
              {selectedTable && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Table</span>
                  <span className="font-bold text-white">
                    {selectedTable.tableCode}{" "}
                    {isSeatBased
                      ? `(${seatQuantity} seat${seatQuantity > 1 ? "s" : ""})`
                      : `(${selectedTable.capacity} Pax)`}
                  </span>
                </div>
              )}
              {alaCarteLines.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Menu Items ({alaCarteLines.reduce((s, l) => s + l.qty, 0)})</span>
                  <span className="font-bold text-white">IDR {alaCarteSubtotal.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Total Belanja</span>
                <span className="font-bold text-white">IDR {totals.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Admin Fee (3%)</span>
                <span className="font-bold text-white">IDR {totals.adminFee.toLocaleString()}</span>
              </div>
              {isMember && (
                <p className="text-xs italic text-zinc-500">
                  Diskon member akan diterapkan otomatis setelah login member terverifikasi.
                </p>
              )}
              {!meetsMinimum && (
                <p className="text-xs font-bold text-ludo-red">
                  Belum memenuhi minimum charge IDR {minimumCharge.toLocaleString()} untuk table {selectedTable?.tableCode}. Tambahkan menu atau ganti package.
                </p>
              )}
              <div className="mt-2 flex items-center justify-between">
                <span className="font-bold text-white">Grand Total</span>
                <span className="text-2xl font-black text-ludo-gold">
                  IDR {totals.grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
            {remainingSeconds !== null && (
              <div
                className={cn(
                  "mb-4 rounded-lg border px-4 py-2 text-center text-sm font-bold",
                  remainingSeconds > 0
                    ? "border-ludo-gold/40 bg-ludo-gold/10 text-ludo-gold"
                    : "border-ludo-red/40 bg-ludo-red/10 text-ludo-red",
                )}
              >
                {remainingSeconds > 0
                  ? `Complete payment within ${formatCountdown(remainingSeconds)} or your table will be released.`
                  : "Your hold has expired. Please refresh this page and select your table again."}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !meetsMinimum || remainingSeconds === 0}
              className="h-14 w-full rounded-full bg-[linear-gradient(90deg,#EF1F28,#F7C600)] text-lg font-black uppercase text-white shadow-[0_14px_34px_rgba(239,31,40,0.24)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(247,198,0,0.3)] disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isSubmitting ? "Processing Checkout..." : "Pay Now"}
            </button>
            <p className="mt-4 text-center text-xs text-zinc-500">
              Your table will be locked for 15 minutes after clicking Pay Now.
            </p>
          </div>
        </section>
      )}
    </form>
  );
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function FilterChip({
  active,
  onClick,
  children,
  small,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 font-bold uppercase transition",
        small ? "h-8 text-[0.65rem]" : "h-9 text-xs",
        active
          ? "border-ludo-gold bg-ludo-gold text-black"
          : "border-white/15 text-zinc-400 hover:border-white/35 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}
