export default function AccessBlocked() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">
          Tidak dapat mengakses
        </h1>
        <p className="mt-4 text-lg text-gray-700">
          Silahkan login terlebih dahulu
        </p>
      </div>
    </div>
  );
}
