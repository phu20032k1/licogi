export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[55vh] w-full max-w-7xl items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-7 text-center shadow-sm">
        <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-slate-100 border-t-orange-500" />
        <p className="mt-5 text-sm font-black text-slate-900">Đang tải dữ liệu LICOGI 18.3</p>
        <p className="mt-2 text-xs leading-5 text-slate-500">Hệ thống đang đồng bộ dữ liệu và giao diện.</p>
      </div>
    </div>
  );
}
