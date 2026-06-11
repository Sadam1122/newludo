type AdminNoticeProps = {
  success?: string;
  error?: string;
};

export function AdminNotice({ success, error }: AdminNoticeProps) {
  if (!success && !error) return null;

  return (
    <div
      className={
        error
          ? "mb-6 rounded border border-ludo-red/50 bg-ludo-red/15 px-4 py-3 text-sm font-semibold text-red-100"
          : "mb-6 rounded border border-ludo-green/50 bg-ludo-green/15 px-4 py-3 text-sm font-semibold text-green-100"
      }
    >
      {error ?? success}
    </div>
  );
}
