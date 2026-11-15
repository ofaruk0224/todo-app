const gorevInput = document.getElementById("gorevInput");
const gorevEkle = document.getElementById("gorevEkle");
const gorevListesi = document.getElementById("gorevListesi");
const temaButonu = document.getElementById("temaButonu");

// Öncelik ve tarih alanları
const oncelikSecimi = document.getElementById("oncelikSecimi");
const tarihInput = document.getElementById("tarihInput");

const toplam = document.querySelector(".toplam h3");
const tamamlanan = document.querySelector(".tamamlanan h3");
const bekleyen = document.querySelector(".bekleyen h3");
const filtreButonlari = document.querySelectorAll(".filtreler button");
const temizleButonu = document.querySelector(".temizle");
const temaIkonu = temaButonu.querySelector("i");

// Öncelik değerlerinin ekranda görünecek karşılıkları
const oncelikEtiketleri = {
  dusuk: "Düşük",
  orta: "Orta",
  yuksek: "Yüksek",
};

// Burada dark-mode sınıfını açıp kapatacağız.
temaButonu.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    temaIkonu.classList.replace("fa-moon", "fa-sun");
  } else {
    temaIkonu.classList.replace("fa-sun", "fa-moon");
  }
  localStorage.setItem(
    "tema",
    document.body.classList.contains("dark-mode") ? "dark" : "light",
  );
});

const kayitliTema = localStorage.getItem("tema");

if (kayitliTema === "dark") {
  document.body.classList.add("dark-mode");
  temaIkonu.classList.replace("fa-moon", "fa-sun");
}

// Görevlerin tutulduğu dizi
let gorevVerileri = [];

// Şu an düzenlenen görevin id'si (hiçbiri düzenlenmiyorsa null)
let duzenlenenId = null;

// Bugünün tarihini "2026-11-06" biçiminde verir (date input ile aynı biçim)
function bugununTarihi() {
  const simdi = new Date();
  const yil = simdi.getFullYear();
  const ay = String(simdi.getMonth() + 1).padStart(2, "0");
  const gun = String(simdi.getDate()).padStart(2, "0");
  return `${yil}-${ay}-${gun}`;
}

// Görevleri ekrana çizme
function gorevleriGoster() {
  gorevListesi.innerHTML = "";

  // Her görev için tekrar hesaplamamak için bir kez alıyoruz
  const bugun = bugununTarihi();

  gorevVerileri.forEach((gorev) => {
    const yeniGorev = document.createElement("li");
    yeniGorev.setAttribute("data-id", gorev.id);

    const gorevAdi = document.createElement("span");
    const checkbox = document.createElement("button");
    const tikIkonu = document.createElement("i");
    const gorevDurum = document.createElement("span");
    const silButonu = document.createElement("button");
    const copKutusuIkon = document.createElement("i");

    const duzenleButonu = document.createElement("button");
    const duzenleIkonu = document.createElement("i");

    const gorevOncelik = document.createElement("span");
    const gorevTarih = document.createElement("span");

    // Tarihi var, tamamlanmamış ve tarihi bugünden önceyse gecikmiş sayılır
    // (aynı biçimdeki tarih metinleri < ile doğru karşılaştırılır)
    const gecikmisMi = !gorev.tamamlandi && gorev.tarih && gorev.tarih < bugun;

    gorevAdi.textContent = gorev.ad;
    if (gorev.tamamlandi) {
      gorevDurum.textContent = "Tamamlandı";
    } else if (gecikmisMi) {
      gorevDurum.textContent = "Gecikti";
    } else {
      gorevDurum.textContent = "Bekliyor";
    }

    gorevOncelik.textContent = oncelikEtiketleri[gorev.oncelik];

    // tarih varsa Türkçe formatla (03.11.2026 gibi), yoksa boş bırak
    if (gorev.tarih) {
      // "T00:00:00" ekleyerek saat dilimi kaynaklı bir gün kaymasını önlüyoruz
      gorevTarih.textContent = new Date(
        gorev.tarih + "T00:00:00",
      ).toLocaleDateString("tr-TR");
    }

    checkbox.classList.add("gorev-checkbox");
    tikIkonu.classList.add("fa-solid", "fa-check");
    gorevAdi.classList.add("gorev-adi");
    gorevDurum.classList.add("gorev-durum");
    silButonu.classList.add("gorev-sil");
    copKutusuIkon.classList.add("fa-regular", "fa-trash-can");

    // bu görev şu an düzenleniyor mu? Düzenleniyorsa kalem yerine tik göster
    const duzenleniyorMu = gorev.id === duzenlenenId;
    duzenleButonu.classList.add("gorev-duzenle");
    duzenleIkonu.classList.add(
      "fa-solid",
      duzenleniyorMu ? "fa-check" : "fa-pen",
    );
    duzenleButonu.appendChild(duzenleIkonu);

    // CSS'te renk vermek için sınıflar
    gorevOncelik.classList.add("gorev-oncelik");
    gorevTarih.classList.add("gorev-tarih");
    yeniGorev.classList.add("oncelik-" + gorev.oncelik);

    checkbox.appendChild(tikIkonu);
    silButonu.appendChild(copKutusuIkon);

    yeniGorev.appendChild(checkbox);

    // Düzenleme modunda ad, öncelik ve tarih yerine düzenlenebilir alanlar göster
    if (duzenleniyorMu) {
      const duzenlemeInput = document.createElement("input");
      duzenlemeInput.type = "text";
      duzenlemeInput.value = gorev.ad;
      duzenlemeInput.classList.add("gorev-duzenle-input");

      const duzenlemeOncelik = document.createElement("select");
      duzenlemeOncelik.classList.add("gorev-duzenle-oncelik");
      // oncelikEtiketleri nesnesindeki her öncelik için bir seçenek oluştur
      Object.keys(oncelikEtiketleri).forEach((anahtar) => {
        const secenek = document.createElement("option");
        secenek.value = anahtar;
        secenek.textContent = oncelikEtiketleri[anahtar];
        secenek.selected = anahtar === gorev.oncelik;
        duzenlemeOncelik.appendChild(secenek);
      });

      const duzenlemeTarih = document.createElement("input");
      duzenlemeTarih.type = "date";
      duzenlemeTarih.value = gorev.tarih;
      duzenlemeTarih.classList.add("gorev-duzenle-tarih");

      yeniGorev.appendChild(duzenlemeInput);
      yeniGorev.appendChild(duzenlemeOncelik);
      yeniGorev.appendChild(duzenlemeTarih);
    } else {
      yeniGorev.appendChild(gorevAdi);
      yeniGorev.appendChild(gorevOncelik);
      yeniGorev.appendChild(gorevTarih);
    }
    yeniGorev.appendChild(gorevDurum);
    yeniGorev.appendChild(duzenleButonu);
    yeniGorev.appendChild(silButonu);

    if (gorev.tamamlandi) {
      yeniGorev.classList.add("tamamlandi");
    }

    if (gecikmisMi) {
      yeniGorev.classList.add("gecikmis");
    }

    gorevListesi.appendChild(yeniGorev);
  });

  filtreyiUygula();
  istatistikGuncelle();

  // Düzenleme açıksa input'a odaklan, imleci yazının sonuna koy
  const aktifInput = gorevListesi.querySelector(".gorev-duzenle-input");
  if (aktifInput) {
    aktifInput.focus();
    aktifInput.setSelectionRange(aktifInput.value.length, aktifInput.value.length);
  }
}

// Filtreleme
function filtreyiUygula() {
  const aktifButon = document.querySelector(".filtreler button.aktif");
  const filtre = aktifButon ? aktifButon.textContent.trim() : "Tümü";

  const gorevler = gorevListesi.querySelectorAll("li");

  gorevler.forEach((gorev) => {
    const tamamlandiMi = gorev.classList.contains("tamamlandi");

    if (filtre === "Tamamlanan") {
      gorev.style.display = tamamlandiMi ? "" : "none";
    } else if (filtre === "Bekleyen") {
      gorev.style.display = tamamlandiMi ? "none" : "";
    } else {
      gorev.style.display = "";
    }
  });
}

filtreButonlari.forEach((buton) => {
  buton.addEventListener("click", () => {
    filtreButonlari.forEach((btn) => {
      btn.classList.remove("aktif");
    });

    buton.classList.add("aktif");
    filtreyiUygula();
  });
});

// Görev ekleme (buton ve Enter tuşu aynı fonksiyonu kullanır)
function gorevEklemeIslemi() {
  const gorev = gorevInput.value.trim();

  if (gorev === "") {
    alert("Lütfen bir görev girin!");
    return;
  }

  const gorevId = Date.now();

  gorevVerileri.push({
    id: gorevId,
    ad: gorev,
    tamamlandi: false,
    // Alanlar bulunamazsa varsayılan değer kullanılır
    oncelik: oncelikSecimi ? oncelikSecimi.value : "orta",
    tarih: tarihInput ? tarihInput.value : "",
  });

  gorevInput.value = "";

  // ekledikten sonra öncelik ve tarih alanlarını sıfırla
  if (oncelikSecimi) oncelikSecimi.value = "orta";
  if (tarihInput) tarihInput.value = "";

  gorevleriGoster();
  gorevleriKaydet();
}

gorevEkle.addEventListener("click", gorevEklemeIslemi);

// Enter tuşuyla ekleme
gorevInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    gorevEklemeIslemi();
  }
});

// İstatistikleri güncelleme
function istatistikGuncelle() {
  toplam.textContent = gorevVerileri.length;

  const tamamlananSayisi = gorevVerileri.filter(
    (gorev) => gorev.tamamlandi,
  ).length;

  tamamlanan.textContent = tamamlananSayisi;
  bekleyen.textContent = gorevVerileri.length - tamamlananSayisi;
}

// Görevlerin tıklamalarını yönetme
gorevListesi.addEventListener("click", (e) => {
  const silButonu = e.target.closest(".gorev-sil");
  const tamamlaButonu = e.target.closest(".gorev-checkbox");
  const duzenleButonu = e.target.closest(".gorev-duzenle");

  // Düzenleme işlemi
  if (duzenleButonu) {
    const gorevId = Number(duzenleButonu.closest("li").dataset.id);

    if (duzenlenenId === gorevId) {
      // Zaten düzenleniyor, tik'e basıldı: kaydet
      gorevDuzenlemeyiKaydet();
    } else {
      // Düzenleme modunu aç
      duzenlenenId = gorevId;
      gorevleriGoster();
    }
    return;
  }

  // Silme işlemi
  if (silButonu) {
    const gorev = silButonu.closest("li");
    const gorevId = Number(gorev.dataset.id);

    gorevVerileri = gorevVerileri.filter((item) => item.id !== gorevId);

    // Silinen görev düzenleniyorsa düzenleme modunu kapat
    if (duzenlenenId === gorevId) duzenlenenId = null;

    gorevleriGoster();
    gorevleriKaydet();
  }

  // Tamamlama işlemi
  if (tamamlaButonu) {
    const gorev = tamamlaButonu.closest("li");
    const gorevId = Number(gorev.dataset.id);

    const gorevVerisi = gorevVerileri.find((item) => item.id === gorevId);

    if (!gorevVerisi) return;

    gorevVerisi.tamamlandi = !gorevVerisi.tamamlandi;

    gorevleriGoster();
    gorevleriKaydet();
  }
});

// Düzenlenen görevin yeni adını kaydetme
function gorevDuzenlemeyiKaydet() {
  const input = gorevListesi.querySelector(".gorev-duzenle-input");
  const oncelikAlani = gorevListesi.querySelector(".gorev-duzenle-oncelik");
  const tarihAlani = gorevListesi.querySelector(".gorev-duzenle-tarih");
  if (!input) return;

  const yeniAd = input.value.trim();

  if (yeniAd === "") {
    alert("Görev adı boş olamaz!");
    return;
  }

  const gorevVerisi = gorevVerileri.find((item) => item.id === duzenlenenId);
  if (!gorevVerisi) return;

  gorevVerisi.ad = yeniAd;
  gorevVerisi.oncelik = oncelikAlani.value;
  gorevVerisi.tarih = tarihAlani.value;
  duzenlenenId = null;

  gorevleriGoster();
  gorevleriKaydet();
}

// Düzenleme sırasında Enter = kaydet, Escape = vazgeç
gorevListesi.addEventListener("keydown", (e) => {
  if (
    !e.target.matches(
      ".gorev-duzenle-input, .gorev-duzenle-oncelik, .gorev-duzenle-tarih",
    )
  )
    return;

  if (e.key === "Enter") {
    gorevDuzenlemeyiKaydet();
  } else if (e.key === "Escape") {
    duzenlenenId = null;
    gorevleriGoster();
  }
});

// Tüm görevleri temizleme
temizleButonu.addEventListener("click", () => {
  // Liste zaten boşsa sormaya gerek yok
  if (gorevVerileri.length === 0) return;

  // Kullanıcı "İptal" derse fonksiyondan çık, hiçbir şey silinmesin
  if (!confirm("Tüm görevler silinecek. Emin misin?")) return;

  gorevVerileri = [];
  duzenlenenId = null;

  gorevleriGoster();
  gorevleriKaydet();
});

// Görevleri JSON olarak kaydetme
function gorevleriKaydet() {
  localStorage.setItem("gorevler", JSON.stringify(gorevVerileri));
}

// Görevleri yükleme
function gorevleriYukle() {
  const kayitliGorevler = localStorage.getItem("gorevler");

  if (kayitliGorevler) {
    try {
      gorevVerileri = JSON.parse(kayitliGorevler);
    } catch (hata) {
      gorevVerileri = [];
      gorevleriKaydet();
    }
  }

  // Eski kayıtlı görevlerde oncelik/tarih yok, varsayılan değer ver
  gorevVerileri = gorevVerileri.map((gorev) => ({
    ...gorev,
    oncelik: gorev.oncelik || "orta",
    tarih: gorev.tarih || "",
  }));

  gorevleriGoster();
}

// Sayfa açıldığında görevleri yükle
gorevleriYukle();