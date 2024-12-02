# nama="dara"
# umur=18
# echo "halo $nama, kamu berumur $umur tahun"

# echo "kamu siapa?"
# read nama #untuk inputan
# echo "halo $nama!"

# echo "masukkan angka!"
# read angka
# if [ $angka -gt 10 ]; then
#     echo "angka lebih besar dari 10"
# elif [ $angka = 10 ]; then
#     echo "angka sama dengan 10"
# else 
#     echo "angka kurang dari 10"
# fi

# echo "masukkan nama file"
# read file
# if [ -f "$file" ]; then
#     echo "file $file ditemukan"
# else 
#     echo "file tidak ada"
# fi

# echo "masukkan direktori"
# read directory
# if [ -d "$directory" ]; then
#     echo "directory $directory ditemukan"
# else 
#     echo "direktori tidak ada"
# fi

# for i in {1..10}; do
#     echo $i
# done

# names=("dara" "aliilah")
# for name in "${names[@]}"; do
#     echo $name
# done

# count=1
# while [ $count -le 5 ]; do
#     echo $count
#     ((count++))
# done

# count=1
# until [ $count -gt 5 ]; do
#     echo $count
#     ((count++))
# done

# names=("dara" "kania" "damanik")
# for i in "${!names[@]}"; do #ambil indeks nya, mulai dari 0
#     echo "$((i+1)): ${names[i]}"
# done

# while true; do

# echo "Kalkulator"
# echo "Pilih operasi"
# echo "1. Penjumlahan (+)"
# echo "2. Pengurangan (-)"
# echo "3. Perkalian (*)"
# echo "4. Pembagian (/)"
# echo "5. Keluar"
# read -p "Masukkan pilihan" pilihan

# if [[ "$pilihan" -gt 5 || "$pilihan" -lt 1 ]]; then
#     echo "pilihan tidak valid, coba lagi"
#     continue
# fi

# read -p "Masukkan angka pertama: " angka1
# read -p "Masukkan angka kedua: " angka2

# case $pilihan in
#     1) 
#       hasil=$((angka1 + angka2))
#       echo "hasil: $hasil"
#       ;;
#     2)
#       hasil=$((angka1 - angka2))
#       echo "hasil: $hasil"
#       ;;
#     3)
#       hasil=$((angka1 * angka2))
#       echo "hasil: $hasil"
#       ;;
#     4)
#       if [ "$angka2" -eq 0 ]; then
#         echo "Error: Pembagian dengan nol tidak diperbolehkan."
#       else
#         hasil=$(echo "scale=2; $angka1 / $angka2" | bc)
#         echo "Hasil: $angka1 / $angka2 = $hasil"
#       fi
#       ;;
# esac
#     echo "Tekan Enter untuk melanjutkan..."
#     read
# done

halo() {
    echo "Halo $1"
}

halo "dara"