// HTML'deki elemanları bağlıyoruz
const gorevInput = document.getElementById("gorevInput");
const gorevEkle = document.getElementById("gorevEkle");
const gorevListesi = document.getElementById("gorevListesi");
const temaButonu = document.getElementById("temaButonu");
const oncelikSecimi = document.getElementById("oncelikSecimi");
const tarihInput = document.getElementById("tarihInput");
const siralamaSecimi = document.getElementById("siralamaSecimi");
const bildirim = document.getElementById("bildirim");
const geriAlButonu = document.getElementById("geriAlButonu");

const toplam = document.querySelector(".toplam h3");
const tamamlanan = document.querySelector(".tamamlanan h3");
const bekleyen = document.querySelector(".bekleyen h3");
const filtreButonlari = document.querySelectorAll(".filtreler button");
const temizleButonu = document.querySelector(".temizle");
const temaIkonu = temaButonu.querySelector("i");

const oncelikEtiketleri = {
  dusuk: "Düşük",
  orta: "Orta",
  yuksek: "Yüksek",
};

// Sıralamada küçük sayı üstte çıkar
const oncelikSirasi = { yuksek: 0, orta: 1, dusuk: 2 };

// Tema değiştirme
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

// Kayıtlı temayı yükle
const kayitliTema = localStorage.getItem("tema");

if (kayitliTema === "dark") {
  document.body.classList.add("dark-mode");
  temaIkonu.classList.replace("fa-moon", "fa-sun");
}

let gorevVerileri = [];

// Düzenlenen görevin id'si, yoksa null
let duzenlenenId = null;

// Son silinen görev ve bildirimin kapanma süresi
let silinenGorev = null;
let bildirimZamanlayici = null;

// Bugünün tarihi "2026-11-15" formatında (date input ile aynı)
function bugununTarihi() {
  const simdi = new Date();
  const yil = simdi.getFullYear();
  const ay = String(simdi.getMonth() + 1).padStart(2, "0");
  const gun = String(simdi.getDate()).padStart(2, "0");
  return `${yil}-${ay}-${gun}`;
}

// Tarihi olmayanlar en sona gider
function tarihKarsilastir(a, b) {
  if (!a.tarih && !b.tarih) return 0;
  if (!a.tarih) return 1;
  if (!b.tarih) return -1;
  return a.tarih.localeCompare(b.tarih);
}

// Ana diziye dokunmadan, kopyasını seçime göre sıralar
function siraliGorevler() {
  const secim = siralamaSecimi.value;
  const kopya = [...gorevVerileri].reverse();

  if (secim === "oncelik") {
    return kopya.sort(
      (a, b) =>
        oncelikSirasi[a.oncelik] - oncelikSirasi[b.oncelik] ||
        tarihKarsilastir(a, b),
    );
  }
  if (secim === "tarih") {
    return kopya.sort(
      (a, b) =>
        tarihKarsilastir(a, b) ||
        oncelikSirasi[a.oncelik] - oncelikSirasi[b.oncelik],
    );
  }
  return kopya; // eklenme sırası
}

// Görevleri ekrana çizme
function gorevleriGoster() {
  gorevListesi.innerHTML = "";

  const bugun = bugununTarihi();

  siraliGorevler().forEach((gorev) => {
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

    // Tarihi bugünden önceyse ve bitmemişse gecikmiş
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

    if (gorev.tarih) {
      // T00:00:00 gün kaymasını engelliyor
      gorevTarih.textContent = new Date(
        gorev.tarih + "T00:00:00",
      ).toLocaleDateString("tr-TR");
    }

    // CSS için sınıflar
    checkbox.classList.add("gorev-checkbox");
    tikIkonu.classList.add("fa-solid", "fa-check");
    gorevAdi.classList.add("gorev-adi");
    gorevDurum.classList.add("gorev-durum");
    silButonu.classList.add("gorev-sil");
    copKutusuIkon.classList.add("fa-regular", "fa-trash-can");
    gorevOncelik.classList.add("gorev-oncelik");
    gorevTarih.classList.add("gorev-tarih");
    yeniGorev.classList.add("oncelik-" + gorev.oncelik);

    // Düzenlenirken kalem yerine tik göster
    const duzenleniyorMu = gorev.id === duzenlenenId;
    duzenleButonu.classList.add("gorev-duzenle");
    duzenleIkonu.classList.add(
      "fa-solid",
      duzenleniyorMu ? "fa-check" : "fa-pen",
    );
    duzenleButonu.appendChild(duzenleIkonu);

    checkbox.appendChild(tikIkonu);
    silButonu.appendChild(copKutusuIkon);

    yeniGorev.appendChild(checkbox);

    // Düzenleme modunda yazı yerine input, select ve date göster
    if (duzenleniyorMu) {
      const duzenlemeInput = document.createElement("input");
      duzenlemeInput.type = "text";
      duzenlemeInput.value = gorev.ad;
      duzenlemeInput.classList.add("gorev-duzenle-input");

      const duzenlemeOncelik = document.createElement("select");
      duzenlemeOncelik.classList.add("gorev-duzenle-oncelik");
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

  // Düzenleme açıksa input'a odaklan, imleç sona
  const aktifInput = gorevListesi.querySelector(".gorev-duzenle-input");
  if (aktifInput) {
    aktifInput.focus();
    aktifInput.setSelectionRange(
      aktifInput.value.length,
      aktifInput.value.length,
    );
  }
}

// Filtreleme (görevi silmiyor, sadece gizliyor)
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

// Görev ekleme (buton ve Enter aynı fonksiyonu kullanıyor)
function gorevEklemeIslemi() {
  const gorev = gorevInput.value.trim();

  if (gorev === "") {
    alert("Lütfen bir görev girin!");
    return;
  }

  gorevVerileri.push({
    id: Date.now(),
    ad: gorev,
    tamamlandi: false,
    oncelik: oncelikSecimi ? oncelikSecimi.value : "orta",
    tarih: tarihInput ? tarihInput.value : "",
  });

  // Alanları sıfırla
  gorevInput.value = "";
  if (oncelikSecimi) oncelikSecimi.value = "orta";
  if (tarihInput) tarihInput.value = "";

  gorevleriGoster();
  gorevleriKaydet();
}

gorevEkle.addEventListener("click", gorevEklemeIslemi);

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

// Liste içindeki tüm tıklamalar burada (sil, tamamla, düzenle)
gorevListesi.addEventListener("click", (e) => {
  const silButonu = e.target.closest(".gorev-sil");
  const tamamlaButonu = e.target.closest(".gorev-checkbox");
  const duzenleButonu = e.target.closest(".gorev-duzenle");

  if (duzenleButonu) {
    const gorevId = Number(duzenleButonu.closest("li").dataset.id);

    if (duzenlenenId === gorevId) {
      gorevDuzenlemeyiKaydet();
    } else {
      duzenlenenId = gorevId;
      gorevleriGoster();
    }
    return;
  }

  if (silButonu) {
    const gorev = silButonu.closest("li");
    const gorevId = Number(gorev.dataset.id);

    // Geri alabilmek için görevi ve yerini saklıyoruz
    const index = gorevVerileri.findIndex((item) => item.id === gorevId);
    if (index === -1) return;
    silinenGorev = { veri: gorevVerileri[index], index };

    gorevVerileri = gorevVerileri.filter((item) => item.id !== gorevId);

    if (duzenlenenId === gorevId) duzenlenenId = null;

    gorevleriGoster();
    gorevleriKaydet();
    bildirimGoster();
  }

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

// Düzenlenen görevi kaydetme
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

// Düzenlerken Enter = kaydet, Escape = vazgeç
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
  if (gorevVerileri.length === 0) return;

  if (!confirm("Tüm görevler silinecek. Emin misin?")) return;

  gorevVerileri = [];
  duzenlenenId = null;

  gorevleriGoster();
  gorevleriKaydet();
});

// Sıralama değişince listeyi yenile ve seçimi kaydet
siralamaSecimi.addEventListener("change", () => {
  localStorage.setItem("siralama", siralamaSecimi.value);
  gorevleriGoster();
});

const kayitliSiralama = localStorage.getItem("siralama");
if (kayitliSiralama) siralamaSecimi.value = kayitliSiralama;

// Bildirimi 5 saniye göster, sonra kapat
function bildirimGoster() {
  bildirim.classList.add("goster");
  clearTimeout(bildirimZamanlayici);
  bildirimZamanlayici = setTimeout(() => {
    bildirim.classList.remove("goster");
    silinenGorev = null;
  }, 5000);
}

geriAlButonu.addEventListener("click", () => {
  if (!silinenGorev) return;

  // Görevi eski yerine geri koy
  gorevVerileri.splice(silinenGorev.index, 0, silinenGorev.veri);
  silinenGorev = null;

  clearTimeout(bildirimZamanlayici);
  bildirim.classList.remove("goster");

  gorevleriGoster();
  gorevleriKaydet();
});

// LocalStorage'a kaydetme
function gorevleriKaydet() {
  localStorage.setItem("gorevler", JSON.stringify(gorevVerileri));
}

// LocalStorage'dan yükleme
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

  // Eski görevlerde öncelik/tarih yoksa varsayılan ver
  gorevVerileri = gorevVerileri.map((gorev) => ({
    ...gorev,
    oncelik: gorev.oncelik || "orta",
    tarih: gorev.tarih || "",
  }));

  gorevleriGoster();
}

gorevleriYukle();
