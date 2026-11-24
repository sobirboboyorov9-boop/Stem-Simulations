# Tanlov Taqdimoti va Demo Ekotizimi (Pitch Showcase & Live Demo Platform)

Ushbu reja tanlov talablariga to‘liq mos keluvchi, hakamlar va ekspertlar uchun maxsus tayyorlangan mustaqil **Taqdimot & Demo (Showcase)** sahifasini platformaga integratsiya qilishni ko‘zda tutadi. Mavjud 100+ interaktiv fan laboratoriyalari, sinf xonalari va AI tyutordan iborat to‘liq tizim aynan **"Ishlaydigan Prototip"** sifatida xizmat qiladi va hech qanday funksiya buzilmaydi yoki qorishib ketmaydi.

### Foydalanuvchi Tasdiqlagan Qarorlar

> [!IMPORTANT]
> 1-bosqichda berilgan savollarga asoslangan tasdiqlar:
> - **Taqdimot joylashuvi**: Platforma ichida alohida `/showcase` (Taqdimot & Demo) sahifasi sifatida yaratiladi. Asosiy menyuda ko‘zga tashlanadigan maxsus tugma orqali o‘tiladi.
> - **Demo video formati**: Integratsiyalashgan interaktiv video pleer + vaqt bo‘yicha bo‘limlar (chapters) + interaktiv taqdimot slayd slayderi.
> - **API integratsiyasi**: Gemini AI Science Tutor API, STEM Simulyatsiyalar API va Virtual Sinf API lari uchun to‘liq ishlaydigan jonli test konsoli (Live Interactive API Console) bilan jihozlanadi.

---

### 1. Umumiy Ko‘rinish va Maqsad (Overview & Core Concept)

- **Loyiha maqsadi**: Tanlov komissiyasi va hakamlarga loyihaning to‘liq qiymatini, texnologik ustunligini, jamoasini, yo‘l xaritasini (roadmap) va real ishlayotgan mahsulotini 1 ta qulay, ixcham va taassurotli sahifada ko‘rsatish.
- **Asosiy qismlar**:
  1. **Muammo va Yechim**: An'anaviy ta'limdagi laboratoriya va amaliy tajriba yetishmovchiligi muammosi va bizning interaktiv raqamli yechimimiz.
  2. **1–5 Daqiqalik Demo Video & Pitch Deck**: Video namoyish, asosiy vaqt belgilari (timestamps), interaktiv slaydlar.
  3. **Ishlaydigan Jonli Prototip**: Sahifaning o‘zida darhol sinab ko‘rish mumkin bo‘lgan interaktiv laboratoriya vidjeti hamda to‘liq platformaga (100+ simulyatsiya, AI tyutor) to‘g‘ridan-to‘g‘ri havolalar.
  4. **Jamoa va Roadmap**: Loyiha asoschilari, mutaxassislar rollari va 2026-yilgi 4 bosqichli rivojlanish xaritasi.
  5. **Jonli API Integratsiyasi Konsoli**: Hakamlar real so‘rov jo‘natib (POST/GET), JSON formatidagi natijalarni ko‘ra oladigan jonli ishlab chiquvchilar konsoli.

---

### 2. Foydalanuvchi Tajribasi va Vizual Dizayn (UX & Visual Design)

- **Aesthetic Direction**: Professional, ishonchli, zamonaviy EdTech mahsuloti ko‘rinishi. Anti-AI slop qoidalariga qat'iy rioya qilgan holda, toza tipografiya, aniq bo‘limlar ketma-ketligi va chiroyli infografikalar.
- **Bo‘limlar oqimi (Section Sequence)**:
  $$\text{Hero (Qiymat taklifi)} \longrightarrow \text{Muammo \& Yechim} \longrightarrow \text{Demo Video \& Slaydlar} \longrightarrow \text{Jonli Prototip} \longrightarrow \text{API Konsoli} \longrightarrow \text{Jamoa \& Roadmap} \longrightarrow \text{CTA / Aloqa}$$

- **Ranglar palitrasi**:
  - Asosiy fon (`canvas`): Tizimning mavjud toza yorug'/qorong'u mavzulariga moslashuvchan.
  - Urg'u ranglar: Chuqur Indigo/Ko'k (`#3B82F6` / `#4F46E5`), ilmiy Zumrad Yashil (`#10B981`) muvaffaqiyat va barqarorlik uchun.
  - Zero-pill tartibi: Hech qanday keraksiz tabletka-belgilar (pill capsules) yo‘q, barcha ma'lumotlar toza matn va chiziqli ajratgichlar bilan ko‘rsatiladi.

---

### 3. Asosiy Mahsulot Qarorlari (Key Product Decisions)

1. **Alohida sahifa arxitekturasi**:
   - Yangi `/showcase` marshruti mavjud Wouter routeriga ulanadi.
   - Saytning yuqori navigatsiya paneliga (Navbar) maxsus **"Taqdimot & Demo"** tugmasi qo‘shiladi.
   - Tanlov uchun baholovchilar ushbu URL orqali to‘g‘ridan-to‘g‘ri taqdimotga kirishlari mumkin (masalan: `https://[url]/showcase`).
2. **Interaktiv Demo Video Pleer**:
   - Video havolasi qo‘yish imkoniyati (YouTube yoki to‘g‘ridan-to‘g‘ri video).
   - Video ostida tezkor vaqt navigatsiyasi (0:00 Muammo, 1:15 Yechim, 2:30 Jonli laboratoriya, 3:45 AI tyutor imkoniyatlari).
   - Yon panelda interaktiv 6 sahifali Pitch Deck (slaydlar) slayderi.
3. **Jonli API Sinov Konsoli (Live API Sandbox)**:
   - 3 ta real API endpoint:
     - `POST /api/tutor/solve` — Gemini AI ilmiy masalalar tahlili va tushuntirish.
     - `GET /api/simulations/catalog` — PhET STEM simulyatsiyalar bazasi.
     - `POST /api/classroom/session` — Virtual interaktiv dars sessiyasini boshqarish.
   - Hakamlar parametrlarni o‘zgartirib "Test Request" tugmasini bosganda real JSON javob va cURL kodini ko‘rishadi.

---

### 4. Texnik Arxitektura va Komponentlar Diagrammasi

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App Navigation (Navbar)                         │
│   [Logo]  ·  Katalog  ·  AI Tyutor  ·  Sinf  ·  [ Taqdimot & Demo ]   │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ (Route: /showcase)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       ShowcasePage.tsx (Taqdimot)                      │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Hero: Loyiha nomi, Shior, Hakamlar uchun qisqacha ma'lumot          │
│ 2. ProblemSolutionSection: 3 ta asosiy muammo vs. 3 ta amaliy yechim   │
│ 3. DemoMediaSection: Interaktiv Video pleer + Timestamps + Slaydlar    │
│ 4. LivePrototypeWidget: Sahifada ishlovchi interaktiv STEM model       │
│ 5. ApiTestingConsole: Jonli API so'rov yuborish va JSON javob paneli   │
│ 6. TeamAndRoadmapSection: Jamoa kartalari va Q1-Q4 2026 rivojlanish     │
│ 7. CompetitionSummaryBanner: Hakamlar uchun PDF/Yuklab olish havolasi  │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 5. Amalga Oshirish Bosqichlari (Implementation Steps)

1. **Yangi sahifa va komponentlar yaratish**:
   - `src/pages/ShowcasePage.tsx` — Asosiy taqdimot va demo ekotizimi.
   - `src/components/showcase/ProblemSolution.tsx` — Muammo va yechim vizual taqqoslash.
   - `src/components/showcase/DemoVideoPlayer.tsx` — Video va slaydlar ko‘rgazmasi.
   - `src/components/showcase/LiveApiConsole.tsx` — Interaktiv API test konsoli.
   - `src/components/showcase/TeamRoadmap.tsx` — Jamoa va yo‘l xaritasi.
2. **Navigatsiya va Router sozlamalari**:
   - `src/App.tsx` da `/showcase` marshrutini ro‘yxatdan o‘tkazish.
   - `src/components/Navbar.tsx` da "Taqdimot & Demo" tugmasini kiritish (ham desktop, ham mobil).
3. **i18n Tarjimalari**:
   - O‘zbek va boshqa tillarda barcha taqdimot matnlarini to‘liq tayyorlash.
4. **Kompilyatsiya va Test**:
   - `compile_applet` va `lint_applet` orqali to‘liq xatosiz ishlashini kafolatlash.
