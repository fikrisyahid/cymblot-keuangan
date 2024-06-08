function stringToRupiah(angka: string) {
  return parseInt(angka)
    .toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
    })
    .replace(" ", " ");
}

export default stringToRupiah;
