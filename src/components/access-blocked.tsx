import MainCard from "./main-card";

export default function AccessBlocked() {
  return (
    <MainCard>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">
          Tidak dapat mengakses
        </h1>
        <p className="mt-4 text-lg text-gray-700">
          Silahkan login terlebih dahulu
        </p>
      </div>
    </MainCard>
  );
}
