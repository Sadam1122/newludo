"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BookingEvent, EventPackage, EventTable } from "@prisma/client";
import {
  AlertTriangle,
  ArrowDown,
  Check,
  ChevronDown,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  UtensilsCrossed,
  X,
} from "lucide-react";
import {
  DELIVERY_CATEGORIES,
  DeliveryCategoryKey,
} from "@/lib/deliveryCategories";
import { computeOrderTotals } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { verifyMemberLogin } from "@/server/actions/publicMemberActions";
import { SeatMap } from "./SeatMap";

type MemberVerifyState = "idle" | "loading" | "verified" | "error";

type SnapClient = {
  pay: (
    token: string,
    callbacks: {
      onSuccess: () => void;
      onPending: () => void;
      onError: () => void;
      onClose: () => void;
    },
  ) => void;
};

type PendingPayment = {
  token: string;
  orderId: string;
  expiresAt: number;
};

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
  const [selectedPackage, setSelectedPackage] = useState<EventPackage | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState<DeliveryCategoryKey | null>(null);
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [memberUsername, setMemberUsername] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [memberVerifyState, setMemberVerifyState] =
    useState<MemberVerifyState>("idle");
  const [memberVerifyError, setMemberVerifyError] = useState<string | null>(
    null,
  );
  const [verifiedDiscountPercent, setVerifiedDiscountPercent] = useState(0);
  const [verifiedBenefitNote, setVerifiedBenefitNote] = useState<string | null>(
    null,
  );
  const [alaCarteCart, setAlaCarteCart] = useState<Record<string, number>>({});
  const [alaCarteNotes, setAlaCarteNotes] = useState<Record<string, string>>(
    {},
  );
  const [seatQuantity, setSeatQuantity] = useState(1);
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(
    null,
  );
  const [isSnapOpen, setIsSnapOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const [cartError, setCartError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [tableSelectionError, setTableSelectionError] = useState<string | null>(
    null,
  );
  const cartDialogRef = useRef<HTMLDivElement>(null);
  const menuCatalogRef = useRef<HTMLElement>(null);
  const packageSectionRef = useRef<HTMLElement>(null);
  const customerSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const storageKey = `ludo-pending-payment:${event.id}`;
    const restoreTimer = window.setTimeout(() => {
      const storedPayment = window.sessionStorage.getItem(storageKey);
      if (!storedPayment) return;

      try {
        const payment = JSON.parse(storedPayment) as PendingPayment;
        if (
          payment.token &&
          payment.orderId &&
          payment.expiresAt > Date.now()
        ) {
          setPendingPayment(payment);
          setHoldExpiresAt(payment.expiresAt);
        } else {
          window.sessionStorage.removeItem(storageKey);
        }
      } catch {
        window.sessionStorage.removeItem(storageKey);
      }
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, [event.id]);

  useEffect(() => {
    if (!holdExpiresAt) return;

    const tick = () => {
      const diff = Math.max(0, Math.round((holdExpiresAt - Date.now()) / 1000));
      setRemainingSeconds(diff);
      if (diff === 0) {
        setPendingPayment(null);
        setIsSnapOpen(false);
        window.sessionStorage.removeItem(`ludo-pending-payment:${event.id}`);
      }
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [event.id, holdExpiresAt]);

  useEffect(() => {
    if (!isCartOpen) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const activeDialogRef = cartDialogRef;

    const focusTimer = window.setTimeout(
      () => activeDialogRef.current?.focus(),
      0,
    );

    function handleDialogKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsCartOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = activeDialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleDialogKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleDialogKeyDown);
      previousFocus?.focus();
    };
  }, [isCartOpen]);

  const isDeliveryOrder = event.eventType === "DELIVERY_ORDER";
  const isSeatBased = event.eventType === "NOBAR_COMMUNITY";
  const showAlaCarte =
    !isDeliveryOrder && event.allowAlaCarte && alaCarteMenu.length > 0;
  // If the event has no tables, it might be a general admission event
  const hasTables = event.tables.length > 0;
  const remainingSeats = selectedTable
    ? selectedTable.capacity - selectedTable.bookedSeats
    : 0;

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
    setCheckoutError(null);
    setTableSelectionError(null);

    const pkgs = event.packages.filter(
      (pkg) => pkg.tableType === table.tableType && !pkg.isSoldOut,
    );

    if (isSeatBased) {
      // NOBAR_COMMUNITY: seats must be chosen first, package is picked as its own
      setSelectedPackage(null);
    } else {
      setSelectedPackage(pkgs.length === 1 ? pkgs[0] : null);
    }

    if (pkgs.length === 0 && !showAlaCarte) {
      setTableSelectionError(
        `No available package is configured for ${table.tableType.replace(/_/g, " ")}. Please choose another table.`,
      );
      return;
    }

    window.setTimeout(() => {
      packageSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const handleCategorySelect = (next: DeliveryCategoryKey | null) => {
    setCategory(next);
    setSubCategory(null);
    setSelectedPackage(null);
  };

  const adjustAlaCarteQty = (packageId: string, delta: number) => {
    setCartError(null);
    setCheckoutError(null);
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

  const removeAlaCarteItem = (packageId: string) => {
    setCartError(null);
    setCheckoutError(null);
    setAlaCarteCart((current) => {
      const next = { ...current };
      delete next[packageId];
      return next;
    });
  };

  const setAlaCarteNote = (packageId: string, note: string) => {
    setAlaCarteNotes((current) => ({ ...current, [packageId]: note }));
  };

  const alaCarteLines = Object.entries(alaCarteCart).flatMap(
    ([packageId, qty]) => {
      const pkg = alaCarteMenu.find((item) => item.id === packageId);
      return pkg ? [{ pkg, qty, note: alaCarteNotes[packageId] ?? "" }] : [];
    },
  );

  // The full menu catalog stays on the page, outside the booking/cart dialogs.
  // Search and collapsed categories keep hundreds of items manageable.
  const normalizedMenuSearch = menuSearch.trim().toLocaleLowerCase("id-ID");
  const alaCarteCategoryGroups = (
    Object.entries(DELIVERY_CATEGORIES) as [
      DeliveryCategoryKey,
      (typeof DELIVERY_CATEGORIES)[DeliveryCategoryKey],
    ][]
  )
    .map(([key, value]) => ({
      key,
      label: value.label,
      items: alaCarteMenu.filter((item) => {
        if (item.category !== key) return false;
        if (!normalizedMenuSearch) return true;
        return [item.name, item.description, item.subCategory]
          .filter(Boolean)
          .some((value) =>
            value!.toLocaleLowerCase("id-ID").includes(normalizedMenuSearch),
          );
      }),
    }))
    .filter((group) => group.items.length > 0);

  const packageSubtotal = selectedPackage
    ? selectedPackage.price *
      (isSeatBased ? seatQuantity : hasTables ? 1 : quantity)
    : 0;
  const alaCarteSubtotal = alaCarteLines.reduce(
    (sum, line) => sum + line.pkg!.price * line.qty,
    0,
  );
  const subtotal = packageSubtotal + alaCarteSubtotal;
  // Tax Service (16.6%) only applies to a la carte items: the whole order on
  // the standalone Delivery Order page, or just the add-on items on top of a
  // table package everywhere else.
  const alaCarteTaxableAmount = isDeliveryOrder ? subtotal : alaCarteSubtotal;
  const activeDiscountPercent =
    isMember && memberVerifyState === "verified" ? verifiedDiscountPercent : 0;
  const totals = computeOrderTotals(
    subtotal,
    activeDiscountPercent,
    alaCarteTaxableAmount,
  );

  const minimumCharge = selectedTable?.basePrice ?? 0;
  const meetsMinimum = minimumCharge === 0 || subtotal >= minimumCharge;
  const hasOrderContent = Boolean(selectedPackage) || alaCarteLines.length > 0;
  const cartItemCount =
    (selectedPackage ? (isSeatBased ? seatQuantity : 1) : 0) +
    alaCarteLines.reduce((sum, line) => sum + line.qty, 0);

  const resetMemberVerification = () => {
    setMemberVerifyState("idle");
    setMemberVerifyError(null);
    setVerifiedDiscountPercent(0);
    setVerifiedBenefitNote(null);
  };

  const handleVerifyMember = async () => {
    if (!memberUsername || !memberPassword) return;
    setMemberVerifyState("loading");
    setMemberVerifyError(null);

    const result = await verifyMemberLogin(memberUsername, memberPassword);

    if (!result.success) {
      setMemberVerifyState("error");
      setMemberVerifyError(result.error);
      setVerifiedDiscountPercent(0);
      setVerifiedBenefitNote(null);
      return;
    }

    setMemberVerifyState("verified");
    setVerifiedDiscountPercent(result.discountPercent);
    setVerifiedBenefitNote(result.benefitNote);
  };

  const openMenuCatalog = () => {
    setCheckoutError(null);
    setCartError(null);
    setIsCartOpen(false);
    window.setTimeout(() => {
      menuCatalogRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const openCart = () => {
    setCheckoutError(null);
    setCartError(null);
    setIsCartOpen(true);
  };

  const scrollToCustomerDetails = () => {
    setCheckoutError(null);
    window.setTimeout(() => {
      customerSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const continueFromCart = () => {
    setCartError(null);
    if (!hasOrderContent) {
      setCartError("Select a package or add at least one menu item.");
      return;
    }
    if (!meetsMinimum) {
      setCartError(
        `Minimum charge for table ${selectedTable?.tableCode} is IDR ${minimumCharge.toLocaleString()}.`,
      );
      return;
    }
    setIsCartOpen(false);
    scrollToCustomerDetails();
  };

  const openSnapPayment = (token: string, orderId: string) => {
    if (isSnapOpen) return;
    const snap = (window as typeof window & { snap?: SnapClient }).snap;
    if (!snap) {
      setCheckoutError(
        "Midtrans belum siap. Tunggu beberapa saat, lalu coba Pay Now kembali.",
      );
      return;
    }

    setCheckoutError(null);
    setIsSnapOpen(true);

    try {
      snap.pay(token, {
        onSuccess: () => {
          window.sessionStorage.removeItem(`ludo-pending-payment:${event.id}`);
          window.location.href = `/book/success?order_id=${orderId}`;
        },
        onPending: () => {
          window.sessionStorage.removeItem(`ludo-pending-payment:${event.id}`);
          window.location.href = `/book/success?order_id=${orderId}`;
        },
        onError: () => {
          setIsSnapOpen(false);
          setCheckoutError(
            "Pembayaran gagal diproses oleh Midtrans. Gunakan tombol Lanjutkan Pembayaran selama waktu hold masih aktif.",
          );
        },
        onClose: () => {
          setIsSnapOpen(false);
          setCheckoutError(
            "Pembayaran ditutup sebelum selesai. Klik Lanjutkan Pembayaran untuk membuka Midtrans lagi tanpa membuat antrean baru.",
          );
          window.setTimeout(() => {
            customerSectionRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "end",
            });
          }, 50);
        },
      });
    } catch {
      setIsSnapOpen(false);
      setCheckoutError(
        "Midtrans gagal dibuka. Silakan klik Lanjutkan Pembayaran untuk mencoba lagi.",
      );
    }
  };

  const resumePendingPayment = () => {
    if (!pendingPayment || remainingSeconds === 0) return;
    openSnapPayment(pendingPayment.token, pendingPayment.orderId);
  };

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCheckoutError(null);
    if (pendingPayment && remainingSeconds !== 0) {
      resumePendingPayment();
      return;
    }
    if (hasTables && !selectedTable) {
      setCheckoutError("Please select a table first.");
      return;
    }
    if (hasTables) {
      // Once a table is selected, a package is no longer mandatory — the
      // customer can satisfy the table's minimum spend with a la carte
      // items alone, as long as something is actually in the order.
      if (!selectedPackage && alaCarteLines.length === 0) {
        setCheckoutError(
          "Please select a package or add at least one menu item.",
        );
        return;
      }
    } else if (!selectedPackage) {
      setCheckoutError("Please select a package.");
      return;
    }
    if (isSeatBased && (seatQuantity < 1 || seatQuantity > remainingSeats)) {
      setCheckoutError(
        `Please select between 1 and ${remainingSeats} seat(s) on this table.`,
      );
      return;
    }
    if (!meetsMinimum) {
      setCheckoutError(
        `Minimum charge for table ${selectedTable?.tableCode} is IDR ${minimumCharge.toLocaleString()}. Please add more items.`,
      );
      return;
    }
    if (isMember && memberVerifyState !== "verified") {
      setCheckoutError(
        'Silakan klik "Cek Member" untuk memverifikasi akun member Anda terlebih dahulu, atau ubah pertanyaan member ke "No".',
      );
      return;
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
          packageId: selectedPackage?.id || null,
          tableId: selectedTable?.id || null,
          quantity: isSeatBased ? seatQuantity : hasTables ? 1 : quantity,
          customer: customerData,
          member: isMember
            ? { username: memberUsername, password: memberPassword }
            : null,
          alaCarteItems: alaCarteLines.map((line) => ({
            packageId: line.pkg!.id,
            quantity: line.qty,
            note: line.note.trim() || undefined,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Checkout failed");

      if (!data.expiredAt) {
        throw new Error("Checkout response is missing the payment hold time.");
      }
      const expiresAt = new Date(data.expiredAt).getTime();
      const payment: PendingPayment = {
        token: data.snapToken,
        orderId: data.orderId,
        expiresAt,
      };
      setHoldExpiresAt(expiresAt);
      setPendingPayment(payment);
      window.sessionStorage.setItem(
        `ludo-pending-payment:${event.id}`,
        JSON.stringify(payment),
      );

      openSnapPayment(data.snapToken, data.orderId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Checkout failed.";
      setCheckoutError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleCheckout} className="space-y-10 pb-24 sm:pb-28">
        {/* 1. Seat Selection (If event has tables) */}
        {hasTables && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                1. Select Your Table
              </h2>
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
            {tableSelectionError ? (
              <p className="mt-3 rounded-lg border border-ludo-red/35 bg-ludo-red/10 px-4 py-3 text-sm font-bold text-red-100">
                {tableSelectionError}
              </p>
            ) : null}
            {selectedTable && selectedTable.basePrice > 0 && (
              <p className="mt-3 rounded-lg border border-ludo-gold/30 bg-ludo-gold/10 px-4 py-2 text-xs font-bold text-ludo-gold">
                Minimum charge for {selectedTable.tableCode}: IDR{" "}
                {selectedTable.basePrice.toLocaleString()}
              </p>
            )}
            {isSeatBased && selectedTable && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4">
                <div>
                  <p className="text-sm font-bold text-white">
                    How many seats?
                  </p>
                  <p className="text-xs text-zinc-400">
                    {remainingSeats} seat(s) left on {selectedTable.tableCode}
                  </p>
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
                  <span className="w-6 text-center text-lg font-bold text-white">
                    {seatQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSeatQuantity((q) => Math.min(remainingSeats, q + 1))
                    }
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
            <h2 className="mb-4 text-xl font-bold text-white">
              1. Browse Menu
            </h2>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                active={category === null}
                onClick={() => handleCategorySelect(null)}
              >
                All
              </FilterChip>
              {Object.entries(DELIVERY_CATEGORIES).map(([key, value]) => (
                <FilterChip
                  key={key}
                  active={category === key}
                  onClick={() =>
                    handleCategorySelect(key as DeliveryCategoryKey)
                  }
                >
                  {value.label}
                </FilterChip>
              ))}
            </div>

            {category && (
              <div className="mt-3 flex flex-wrap gap-2">
                <FilterChip
                  active={subCategory === null}
                  onClick={() => setSubCategory(null)}
                  small
                >
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
          <section
            ref={packageSectionRef}
            className="scroll-mt-24 animate-in fade-in slide-in-from-bottom-4"
          >
            <h2 className="mb-4 text-xl font-bold text-white">
              {hasTables
                ? "2. Select Package"
                : isDeliveryOrder
                  ? "2. Select Menu"
                  : "1. Select Package"}
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
                  This table type does not have a package configured yet. Please
                  pick another table, or contact us on WhatsApp and our team
                  will help you complete this booking directly.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {matchingPackages.map((pkg) => {
                  const isSelected = selectedPackage?.id === pkg.id;
                  const isSoldOut = pkg.isSoldOut;
                  return (
                    <button
                      type="button"
                      key={pkg.id}
                      disabled={isSoldOut}
                      onClick={() => {
                        if (isSoldOut) return;
                        setCheckoutError(null);
                        setSelectedPackage(isSelected ? null : pkg);
                      }}
                      className={cn(
                        "relative flex flex-col items-start overflow-hidden rounded-xl border text-left transition-all",
                        isSoldOut
                          ? "cursor-not-allowed border-white/10 bg-black/20 opacity-50"
                          : isSelected
                            ? "border-ludo-gold bg-ludo-gold/10 shadow-[0_0_20px_rgba(247,198,0,0.15)]"
                            : "border-white/10 bg-black/20 hover:border-white/30",
                      )}
                    >
                      {pkg.posterImage && (
                        <div className="relative w-full">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={pkg.posterImage}
                            alt={pkg.name}
                            className={cn(
                              "h-36 w-full object-cover sm:h-44",
                              isSoldOut && "grayscale",
                            )}
                          />
                          {isSoldOut && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <span className="rounded-full border border-ludo-red/50 bg-ludo-red/20 px-3 py-1 text-xs font-black uppercase text-red-100">
                                Sold Out
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex w-full flex-col p-5">
                        <div className="flex w-full items-start justify-between">
                          <div>
                            <h3 className="font-bold text-white">
                              {pkg.name}
                              {isSoldOut && !pkg.posterImage && (
                                <span className="ml-2 rounded-full border border-ludo-red/50 bg-ludo-red/20 px-2 py-0.5 text-[10px] font-black uppercase text-red-100">
                                  Sold Out
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-zinc-400">
                              {isDeliveryOrder
                                ? [pkg.category, pkg.subCategory]
                                    .filter(Boolean)
                                    .join(" • ")
                                : (pkg.tableType?.replace(/_/g, " ") ?? "")}
                            </p>
                            {pkg.description && (
                              <p className="mt-1 text-xs text-zinc-500">
                                {pkg.description}
                              </p>
                            )}
                          </div>
                          {isSelected && !isSoldOut && (
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

        {/* À La Carte Add-on Menu (Booking Events only, when enabled). Visible
          once a table is picked — a package is no longer required to reach
          it, since a la carte items alone can satisfy the table's minimum
          spend. */}
        {showAlaCarte && (hasTables ? selectedTable : selectedPackage) && (
          <section
            ref={menuCatalogRef}
            className="scroll-mt-24 animate-in fade-in slide-in-from-bottom-4"
          >
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">Add Menu Items</h2>
                <p className="mt-1 text-xs text-zinc-400">
                  Cari dari seluruh menu, lalu cek pilihan Anda melalui Cart.
                </p>
              </div>
              {hasOrderContent ? (
                <button
                  type="button"
                  onClick={openCart}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ludo-gold/40 bg-ludo-gold/10 px-4 text-xs font-black uppercase text-ludo-gold"
                >
                  <ShoppingCart className="size-4" aria-hidden="true" />
                  View Cart ({cartItemCount})
                </button>
              ) : null}
            </div>

            <label className="relative mb-4 block">
              <span className="sr-only">Search menu</span>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
                aria-hidden="true"
              />
              <input
                type="search"
                value={menuSearch}
                onChange={(event) => setMenuSearch(event.target.value)}
                placeholder="Cari nama menu atau kategori..."
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-ludo-gold"
              />
            </label>

            {alaCarteLines.length > 0 && (
              <div className="sticky top-20 z-10 mb-4 rounded-xl border border-ludo-gold/30 bg-[#0a0a0a]/95 p-4 shadow-lg backdrop-blur-md">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-black uppercase tracking-wide text-ludo-gold">
                    Menu Terpilih (
                    {alaCarteLines.reduce((sum, line) => sum + line.qty, 0)})
                  </p>
                  <p className="text-sm font-black text-ludo-gold">
                    IDR {alaCarteSubtotal.toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {alaCarteLines.map((line) => (
                    <span
                      key={line.pkg!.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 py-1 pl-3 pr-1.5 text-xs font-semibold text-white"
                    >
                      {line.pkg!.name} × {line.qty}
                      <button
                        type="button"
                        onClick={() => removeAlaCarteItem(line.pkg!.id)}
                        className="flex h-4 w-4 items-center justify-center rounded-full text-zinc-400 hover:bg-ludo-red hover:text-white"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {alaCarteCategoryGroups.map((group) => (
                <AlaCarteCategorySection
                  key={group.key}
                  label={group.label}
                  items={group.items}
                  alaCarteCart={alaCarteCart}
                  alaCarteNotes={alaCarteNotes}
                  adjustAlaCarteQty={adjustAlaCarteQty}
                  setAlaCarteNote={setAlaCarteNote}
                  forceOpen={Boolean(normalizedMenuSearch)}
                />
              ))}
            </div>
            {normalizedMenuSearch && alaCarteCategoryGroups.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-zinc-400">
                Menu yang dicari tidak ditemukan.
              </div>
            ) : null}
          </section>
        )}

        {/* 3. Customer Details & Checkout */}
        {(hasTables ? selectedTable : selectedPackage) && (
          <section
            ref={customerSectionRef}
            className="scroll-mt-24 animate-in fade-in slide-in-from-bottom-4 space-y-4"
          >
            <h2 className="mb-4 text-xl font-bold text-white">
              Customer Details
            </h2>
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
                <p className="text-sm font-bold text-white">
                  Apakah Anda member?
                </p>
                <div className="flex overflow-hidden rounded-full border border-white/15">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMember(false);
                      setMemberUsername("");
                      setMemberPassword("");
                      resetMemberVerification();
                    }}
                    className={cn(
                      "h-9 px-4 text-xs font-black uppercase transition",
                      !isMember
                        ? "bg-ludo-gold text-black"
                        : "text-zinc-400 hover:text-white",
                    )}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMember(true)}
                    className={cn(
                      "h-9 px-4 text-xs font-black uppercase transition",
                      isMember
                        ? "bg-ludo-gold text-black"
                        : "text-zinc-400 hover:text-white",
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
                      onChange={(e) => {
                        setMemberUsername(e.target.value);
                        resetMemberVerification();
                      }}
                      placeholder="Member Username"
                      className="h-11 w-full rounded border border-white/10 bg-black/30 px-3 text-white outline-none focus:border-ludo-gold"
                      required={isMember}
                    />
                    <input
                      type="password"
                      value={memberPassword}
                      onChange={(e) => {
                        setMemberPassword(e.target.value);
                        resetMemberVerification();
                      }}
                      placeholder="Member Password"
                      className="h-11 w-full rounded border border-white/10 bg-black/30 px-3 text-white outline-none focus:border-ludo-gold"
                      required={isMember}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleVerifyMember}
                      disabled={
                        !memberUsername ||
                        !memberPassword ||
                        memberVerifyState === "loading" ||
                        memberVerifyState === "verified"
                      }
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-ludo-gold px-5 text-xs font-black uppercase text-black transition hover:bg-ludo-gold/90 disabled:opacity-50"
                    >
                      {memberVerifyState === "loading" ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Memeriksa...
                        </>
                      ) : memberVerifyState === "verified" ? (
                        <>
                          <Check className="size-3.5" />
                          Terverifikasi
                        </>
                      ) : (
                        "Cek Member"
                      )}
                    </button>
                    {memberVerifyState === "verified" && (
                      <span className="text-xs font-bold text-ludo-green">
                        Diskon {verifiedDiscountPercent}% berhasil diterapkan ke
                        Total Belanja.
                      </span>
                    )}
                    {memberVerifyState === "error" && memberVerifyError && (
                      <span className="text-xs font-bold text-ludo-red">
                        {memberVerifyError}
                      </span>
                    )}
                  </div>

                  {memberVerifyState === "verified" && verifiedBenefitNote ? (
                    <p className="text-xs leading-relaxed text-ludo-gold/80">
                      {verifiedBenefitNote}
                    </p>
                  ) : (
                    <p className="text-xs leading-relaxed text-zinc-400">
                      Masukkan username &amp; password member Anda, lalu klik
                      &quot;Cek Member&quot; untuk melihat dan menerapkan diskon
                      Anda sebelum membayar.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8 rounded-xl bg-ludo-gold/10 p-6">
              <div className="mb-4 flex flex-col gap-2 border-b border-ludo-gold/20 pb-4">
                {selectedPackage && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">
                      Selected {isDeliveryOrder ? "Menu" : "Package"}
                    </span>
                    <span className="font-bold text-white">
                      {selectedPackage.name}
                    </span>
                  </div>
                )}
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
                    <span className="text-zinc-400">
                      Menu Items ({alaCarteLines.reduce((s, l) => s + l.qty, 0)}
                      )
                    </span>
                    <span className="font-bold text-white">
                      IDR {alaCarteSubtotal.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Total Belanja</span>
                  <span className="font-bold text-white">
                    IDR {totals.subtotal.toLocaleString()}
                  </span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">
                      Diskon Member ({totals.discountPercent}%)
                    </span>
                    <span className="font-bold text-ludo-green">
                      - IDR {totals.discountAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                {totals.taxServiceAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Tax Service</span>
                    <span className="font-bold text-white">
                      IDR {totals.taxServiceAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Admin Fee</span>
                  <span className="font-bold text-white">
                    IDR {totals.adminFee.toLocaleString()}
                  </span>
                </div>
                {isMember && memberVerifyState !== "verified" && (
                  <p className="text-xs italic text-zinc-500">
                    Diskon member belum diterapkan. Klik &quot;Cek Member&quot;
                    di atas untuk menerapkannya.
                  </p>
                )}
                {!hasOrderContent && (
                  <p className="text-xs font-bold text-ludo-red">
                    Pilih package atau tambahkan minimal 1 menu untuk
                    melanjutkan.
                  </p>
                )}
                {hasOrderContent && !meetsMinimum && (
                  <p className="text-xs font-bold text-ludo-red">
                    Belum memenuhi minimum charge IDR{" "}
                    {minimumCharge.toLocaleString()} untuk table{" "}
                    {selectedTable?.tableCode}. Tambahkan menu atau ganti
                    package.
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
                    "mb-4 rounded-xl border px-4 py-3 text-center text-sm font-bold",
                    remainingSeconds > 0
                      ? "border-ludo-gold/40 bg-ludo-gold/10 text-ludo-gold"
                      : "border-ludo-red/40 bg-ludo-red/10 text-ludo-red",
                  )}
                >
                  <p>
                    {remainingSeconds > 0
                      ? `Complete payment within ${formatCountdown(remainingSeconds)} or your table will be released.`
                      : "Your hold has expired. Please refresh this page and select your table again."}
                  </p>
                </div>
              )}
              {checkoutError ? (
                <div
                  role="alert"
                  className="mb-4 flex items-start gap-3 rounded-xl border border-ludo-red/40 bg-ludo-red/10 p-4 text-sm font-bold text-red-100"
                >
                  <AlertTriangle
                    className="mt-0.5 size-5 shrink-0"
                    aria-hidden="true"
                  />
                  {checkoutError}
                </div>
              ) : null}
              {pendingPayment && remainingSeconds !== 0 ? (
                <button
                  type="button"
                  onClick={resumePendingPayment}
                  disabled={isSnapOpen}
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(90deg,#EF1F28,#F7C600)] text-lg font-black uppercase text-white shadow-[0_14px_34px_rgba(239,31,40,0.24)] transition hover:-translate-y-1 disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isSnapOpen ? (
                    <Loader2
                      className="size-5 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <CreditCard className="size-5" aria-hidden="true" />
                  )}
                  {isSnapOpen
                    ? "Midtrans Sedang Terbuka"
                    : "Lanjutkan Pembayaran"}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !hasOrderContent ||
                    !meetsMinimum ||
                    remainingSeconds === 0
                  }
                  className="h-14 w-full rounded-full bg-[linear-gradient(90deg,#EF1F28,#F7C600)] text-lg font-black uppercase text-white shadow-[0_14px_34px_rgba(239,31,40,0.24)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(247,198,0,0.3)] disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? "Processing Checkout..." : "Pay Now"}
                </button>
              )}
              <p className="mt-4 text-center text-xs text-zinc-500">
                Your table will be locked for 15 minutes after clicking Pay Now.
              </p>
            </div>
          </section>
        )}
      </form>

      {(hasOrderContent || pendingPayment) && !isCartOpen
        ? createPortal(
            <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[90] sm:left-auto sm:right-6 sm:w-full sm:max-w-md">
              <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/15 bg-[#080808]/95 p-2 shadow-[0_20px_70px_rgba(0,0,0,0.7)] backdrop-blur-xl">
                <button
                  type="button"
                  onClick={
                    pendingPayment && remainingSeconds !== 0
                      ? resumePendingPayment
                      : scrollToCustomerDetails
                  }
                  disabled={isSnapOpen}
                  className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl bg-[linear-gradient(90deg,#EF1F28,#F7C600)] px-4 py-2 text-left text-white transition hover:brightness-110 disabled:opacity-60"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black/20">
                    {pendingPayment && remainingSeconds !== 0 ? (
                      isSnapOpen ? (
                        <Loader2
                          className="size-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <CreditCard className="size-4" aria-hidden="true" />
                      )
                    ) : (
                      <ArrowDown className="size-4" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-black uppercase">
                      {pendingPayment && remainingSeconds !== 0
                        ? isSnapOpen
                          ? "Midtrans Sedang Terbuka"
                          : "Lanjutkan Pembayaran"
                        : "Lanjut ke Data Customer"}
                    </span>
                    <span className="block truncate text-[0.65rem] font-bold text-white/75">
                      {pendingPayment &&
                      remainingSeconds !== null &&
                      remainingSeconds > 0
                        ? `Sisa waktu ${formatCountdown(remainingSeconds)}`
                        : `Total IDR ${totals.grandTotal.toLocaleString()}`}
                    </span>
                  </span>
                </button>

                {hasOrderContent ? (
                  <button
                    type="button"
                    onClick={openCart}
                    className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-ludo-gold text-black shadow-lg transition hover:scale-105"
                    aria-label={`Open cart with ${cartItemCount} item(s)`}
                  >
                    <ShoppingCart className="size-5" aria-hidden="true" />
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ludo-red px-1 text-[0.6rem] font-black text-white">
                      {cartItemCount}
                    </span>
                  </button>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}

      {isCartOpen && hasOrderContent
        ? createPortal(
            <BookingCartDialog
              dialogRef={cartDialogRef}
              selectedTable={selectedTable}
              selectedPackage={selectedPackage}
              packageQuantity={
                isSeatBased ? seatQuantity : hasTables ? 1 : quantity
              }
              packageSubtotal={packageSubtotal}
              lines={alaCarteLines}
              alaCarteSubtotal={alaCarteSubtotal}
              subtotal={subtotal}
              minimumCharge={minimumCharge}
              meetsMinimum={meetsMinimum}
              cartError={cartError}
              showBrowseMenu={showAlaCarte}
              onClose={() => setIsCartOpen(false)}
              onChangePackage={() => {
                setIsCartOpen(false);
                window.setTimeout(() => {
                  packageSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }, 50);
              }}
              onBrowseMenu={openMenuCatalog}
              onAdjustQuantity={adjustAlaCarteQty}
              onRemoveItem={removeAlaCarteItem}
              onSetNote={setAlaCarteNote}
              onContinue={continueFromCart}
            />,
            document.body,
          )
        : null}
    </>
  );
}

type CartLine = {
  pkg: EventPackage;
  qty: number;
  note: string;
};

function BookingCartDialog({
  dialogRef,
  selectedTable,
  selectedPackage,
  packageQuantity,
  packageSubtotal,
  lines,
  alaCarteSubtotal,
  subtotal,
  minimumCharge,
  meetsMinimum,
  cartError,
  showBrowseMenu,
  onClose,
  onChangePackage,
  onBrowseMenu,
  onAdjustQuantity,
  onRemoveItem,
  onSetNote,
  onContinue,
}: {
  dialogRef: React.RefObject<HTMLDivElement | null>;
  selectedTable: EventTable | null;
  selectedPackage: EventPackage | null;
  packageQuantity: number;
  packageSubtotal: number;
  lines: CartLine[];
  alaCarteSubtotal: number;
  subtotal: number;
  minimumCharge: number;
  meetsMinimum: boolean;
  cartError: string | null;
  showBrowseMenu: boolean;
  onClose: () => void;
  onChangePackage: () => void;
  onBrowseMenu: () => void;
  onAdjustQuantity: (packageId: string, delta: number) => void;
  onRemoveItem: (packageId: string) => void;
  onSetNote: (packageId: string, note: string) => void;
  onContinue: () => void;
}) {
  const menuQuantity = lines.reduce((sum, line) => sum + line.qty, 0);

  return (
    <div
      className="fixed inset-0 z-[130] flex items-end justify-center bg-black/85 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inline-booking-cart-title"
        tabIndex={-1}
        className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] border border-white/15 bg-[#090909] text-white shadow-[0_30px_120px_rgba(0,0,0,0.8)] outline-none sm:max-w-2xl sm:rounded-[28px]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="shrink-0 border-b border-white/10 bg-[linear-gradient(110deg,#170303,#090909)] px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {selectedTable ? (
                <p className="text-xs font-black uppercase tracking-[0.16em] text-ludo-gold">
                  Table {selectedTable.tableCode}
                </p>
              ) : null}
              <h2
                id="inline-booking-cart-title"
                className="mt-1 text-xl font-black uppercase sm:text-2xl"
              >
                Your Cart
              </h2>
              <p className="mt-1 text-xs text-white/45">
                Hanya package dan menu yang sudah dipilih.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-ludo-red hover:bg-ludo-red"
              aria-label="Close cart"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
          <section aria-labelledby="inline-cart-package-title">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3
                id="inline-cart-package-title"
                className="text-sm font-black uppercase tracking-[0.14em] text-white/50"
              >
                Package
              </h3>
              <button
                type="button"
                onClick={onChangePackage}
                className="min-h-9 rounded-full border border-white/15 px-4 text-[0.65rem] font-black uppercase text-white transition hover:border-ludo-gold hover:text-ludo-gold"
              >
                {selectedPackage ? "Change Package" : "Select Package"}
              </button>
            </div>
            {selectedPackage ? (
              <div className="flex items-center justify-between gap-4 rounded-xl border border-ludo-gold/25 bg-ludo-gold/[0.07] p-4">
                <div className="min-w-0">
                  <p className="break-words font-black text-white">
                    {selectedPackage.name}
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    Quantity: {packageQuantity}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-black text-ludo-gold">
                  IDR {packageSubtotal.toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-white/40">
                No package selected. Anda dapat melanjutkan dengan menu
                à-la-carte jika minimum charge sudah terpenuhi.
              </div>
            )}
          </section>

          <section aria-labelledby="inline-cart-menu-title">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3
                id="inline-cart-menu-title"
                className="text-sm font-black uppercase tracking-[0.14em] text-white/50"
              >
                Menu Items ({menuQuantity})
              </h3>
              {showBrowseMenu ? (
                <button
                  type="button"
                  onClick={onBrowseMenu}
                  className="min-h-9 rounded-full border border-white/15 px-4 text-[0.65rem] font-black uppercase text-white transition hover:border-ludo-gold hover:text-ludo-gold"
                >
                  Browse Menu
                </button>
              ) : null}
            </div>

            {lines.length > 0 ? (
              <div className="space-y-3">
                {lines.map((line) => (
                  <div
                    key={line.pkg.id}
                    className="rounded-xl border border-white/10 bg-white/[0.035] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-black text-white">
                          {line.pkg.name}
                        </p>
                        <p className="mt-1 text-xs font-bold text-ludo-gold">
                          IDR {line.pkg.price.toLocaleString()} each
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(line.pkg.id)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/40 transition hover:bg-ludo-red hover:text-white"
                        aria-label={`Remove ${line.pkg.name} from cart`}
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onAdjustQuantity(line.pkg.id, -1)}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15"
                          aria-label={`Decrease ${line.pkg.name}`}
                        >
                          <Minus className="size-4" aria-hidden="true" />
                        </button>
                        <span className="w-8 text-center font-black">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onAdjustQuantity(line.pkg.id, 1)}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 hover:border-ludo-gold"
                          aria-label={`Increase ${line.pkg.name}`}
                        >
                          <Plus className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="text-sm font-black text-white">
                        IDR {(line.pkg.price * line.qty).toLocaleString()}
                      </p>
                    </div>
                    <input
                      type="text"
                      value={line.note}
                      onChange={(event) =>
                        onSetNote(line.pkg.id, event.target.value)
                      }
                      placeholder="Catatan menu (opsional)"
                      maxLength={200}
                      className="mt-3 h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-xs text-white outline-none focus:border-ludo-gold"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-white/40">
                Belum ada menu tambahan di Cart.
              </div>
            )}
          </section>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="space-y-2">
              <SummaryRow label="Package">
                IDR {packageSubtotal.toLocaleString()}
              </SummaryRow>
              <SummaryRow label="Menu">
                IDR {alaCarteSubtotal.toLocaleString()}
              </SummaryRow>
              <SummaryRow label="Current subtotal" large>
                IDR {subtotal.toLocaleString()}
              </SummaryRow>
            </div>
            {minimumCharge > 0 ? (
              <p
                className={cn(
                  "mt-3 text-xs font-bold",
                  meetsMinimum ? "text-ludo-green" : "text-ludo-red",
                )}
              >
                {meetsMinimum
                  ? "Minimum charge reached."
                  : `Add IDR ${(minimumCharge - subtotal).toLocaleString()} more to reach the minimum charge.`}
              </p>
            ) : null}
          </div>

          {cartError ? (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-ludo-red/40 bg-ludo-red/10 p-4 text-sm font-bold text-red-100"
            >
              <AlertTriangle
                className="mt-0.5 size-5 shrink-0"
                aria-hidden="true"
              />
              {cartError}
            </div>
          ) : null}
        </div>

        <footer className="shrink-0 border-t border-white/10 bg-[#0D0D0D] px-4 py-3 sm:px-6 sm:py-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-full border border-white/15 px-4 text-xs font-black uppercase text-white"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onContinue}
              className="min-h-11 rounded-full bg-[linear-gradient(90deg,#EF1F28,#F7C600)] px-4 text-xs font-black uppercase text-white shadow-lg"
            >
              Lanjut Isi Data
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function SummaryRow({
  label,
  children,
  accent,
  large = false,
}: {
  label: string;
  children: React.ReactNode;
  accent?: "green";
  large?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span
        className={cn(
          "text-white/50",
          large ? "text-base font-black text-white" : "text-sm",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "max-w-[62%] break-words text-right font-bold",
          large ? "text-lg text-ludo-gold sm:text-xl" : "text-sm text-white",
          accent === "green" && "text-ludo-green",
        )}
      >
        {children}
      </span>
    </div>
  );
}

function AlaCarteCategorySection({
  label,
  items,
  alaCarteCart,
  alaCarteNotes,
  adjustAlaCarteQty,
  setAlaCarteNote,
  forceOpen = false,
}: {
  label: string;
  items: EventPackage[];
  alaCarteCart: Record<string, number>;
  alaCarteNotes: Record<string, string>;
  adjustAlaCarteQty: (packageId: string, delta: number) => void;
  setAlaCarteNote: (packageId: string, note: string) => void;
  forceOpen?: boolean;
}) {
  const selectedCount = items.reduce(
    (sum, item) => sum + (alaCarteCart[item.id] ?? 0),
    0,
  );
  // Initial value only — auto-expand a category that already has a
  // selection so the customer doesn't lose sight of it, but afterwards this
  // is fully manual so toggling one category never fights the user.
  const [isOpen, setIsOpen] = useState(selectedCount > 0);
  const isExpanded = forceOpen || isOpen;

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/10">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <span className="flex items-center gap-2 font-bold text-white">
          {label}
          <span className="text-xs font-normal text-zinc-500">
            ({items.length})
          </span>
        </span>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <span className="rounded-full bg-ludo-gold px-2 py-0.5 text-[10px] font-black text-black">
              {selectedCount} dipilih
            </span>
          )}
          <ChevronDown
            className={cn(
              "size-4 text-zinc-400 transition-transform",
              isExpanded && "rotate-180",
            )}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-3 border-t border-white/10 p-4 pt-3">
          {items.map((item) => {
            const qty = alaCarteCart[item.id] ?? 0;
            const isSoldOut = item.isSoldOut;
            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-xl border border-white/10 bg-black/20 p-4",
                  isSoldOut && "opacity-50",
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white/5">
                      {item.posterImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.posterImage}
                          alt={item.name}
                          className={cn(
                            "h-full w-full object-cover",
                            isSoldOut && "grayscale",
                          )}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <UtensilsCrossed className="size-5 text-zinc-600" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">
                        {item.name}
                      </p>
                      {item.subCategory && (
                        <p className="text-xs text-zinc-400">
                          {item.subCategory}
                        </p>
                      )}
                      <p className="mt-1 text-sm font-black text-ludo-gold">
                        IDR {item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {isSoldOut ? (
                    <span className="shrink-0 self-start rounded-full border border-ludo-red/50 bg-ludo-red/20 px-3 py-1 text-xs font-black uppercase text-red-100 sm:self-center">
                      Sold Out
                    </span>
                  ) : (
                    <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
                      <button
                        type="button"
                        onClick={() => adjustAlaCarteQty(item.id, -1)}
                        disabled={qty === 0}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white disabled:opacity-30"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-white">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustAlaCarteQty(item.id, 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white hover:border-ludo-gold"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {!isSoldOut && qty > 0 && (
                  <input
                    type="text"
                    value={alaCarteNotes[item.id] ?? ""}
                    onChange={(e) => setAlaCarteNote(item.id, e.target.value)}
                    placeholder="Catatan (opsional): less sugar, less ice, hot, no spicy..."
                    maxLength={200}
                    className="mt-3 h-10 w-full rounded border border-white/10 bg-black/30 px-3 text-xs text-white outline-none focus:border-ludo-gold"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
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
