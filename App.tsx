import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Heart,
  Clock,
  Send,
  Sparkles,
  ChevronDown,
  MessageCircle,
  Quote,
  Gift,
  Copy,
  Check,
  CreditCard,
} from "lucide-react";
import { WEDDING_DATA } from "./constants";
import { GuestWish } from "./types";
import MusicPlayer from "./components/MusicPlayer";
import EnvelopeOverlay from "./components/EnvelopeOverlay";
import { generateTraditionalBlessing } from "./services/geminiService";
import {
  fetchWishes,
  addWish,
  WISHES_API_URL,
} from "./services/wishesService";

const App: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [aiBlessing, setAiBlessing] = useState<string>("");
  const [wishes, setWishes] = useState<GuestWish[]>([]);
  const [wishesLoading, setWishesLoading] = useState<boolean>(true);
  const [wishesError, setWishesError] = useState<string | null>(null);
  const [submittingWish, setSubmittingWish] = useState<boolean>(false);
  const [newWish, setNewWish] = useState({ name: "", message: "" });
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  useEffect(() => {
    // CARA MENGATUR NAMA TAMU:
    // Tambahkan parameter "?to=Nama+Tamu" di akhir URL.
    // Contoh: https://link-undangan.com/?to=Bapak+Jokowi
    const params = new URLSearchParams(window.location.search);
    const to = params.get("to");

    // Formatting nama: mengganti plus (+) atau %20 menjadi spasi
    if (to) {
      setGuestName(decodeURIComponent(to));
    } else {
      setGuestName("Tamu Undangan");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setWishesLoading(true);
        setWishesError(null);
        const list = await fetchWishes();
        if (!cancelled) setWishes(list);
      } catch (err) {
        if (!cancelled) {
          setWishesError(
            err instanceof Error ? err.message : "Gagal memuat ucapan",
          );
        }
      } finally {
        if (!cancelled) setWishesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpen = async () => {
    setIsOpen(true);
    // Auto scroll ke awal konten setelah dibuka
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Generate AI blessing
    if (!aiBlessing) {
      const blessing = await generateTraditionalBlessing(
        guestName,
        WEDDING_DATA.bride.name,
        WEDDING_DATA.groom.name,
      );
      setAiBlessing(blessing);
    }
  };

  const handleSubmitWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWish.name.trim() || !newWish.message.trim()) return;
    if (submittingWish) return;

    try {
      setSubmittingWish(true);
      setWishesError(null);
      const saved = await addWish({
        name: newWish.name.trim(),
        message: newWish.message.trim(),
      });
      setWishes((prev: GuestWish[]) => [saved, ...prev]);
      setNewWish({ name: "", message: "" });
    } catch (err) {
      setWishesError(
        err instanceof Error ? err.message : "Gagal mengirim ucapan",
      );
    } finally {
      setSubmittingWish(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(text);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#fcfaf2] selection:bg-[#8b6e4e] selection:text-white relative">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="landing-page"
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.8 }}
          >
            <EnvelopeOverlay to={guestName} onOpen={handleOpen} />
          </motion.div>
        ) : (
          <motion.div
            key="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <MusicPlayer autoStart={true} />

            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center animate-zoom bg-[#4a3728]"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=2000')`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70"></div>
              </div>

              <div className="relative z-10 text-center text-white px-6">
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                >
                  <p className="font-serif-elegant tracking-[0.5em] text-xs md:text-sm mb-6 uppercase drop-shadow-md">
                    Walimatul Ursy
                  </p>
                  <h2 className="font-serif-elegant font-light text-6xl md:text-8xl mb-4 drop-shadow-2xl text-[#fcfaf2] tracking-wide">
                    {WEDDING_DATA.bride.name} & {WEDDING_DATA.groom.name}
                  </h2>
                  <div className="w-20 md:w-32 h-[1.5px] bg-[#c4a484] mx-auto my-8"></div>
                  <p className="text-lg md:text-3xl font-light tracking-[0.2em] drop-shadow-md text-[#fcfaf2]">
                    {WEDDING_DATA.reception.date}
                  </p>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 15, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.5,
                    ease: "easeInOut",
                  }}
                  className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-70"
                >
                  <ChevronDown size={32} className="text-[#fcfaf2]" />
                </motion.div>
              </div>
            </section>

            {/* Verse Section */}
            <section className="py-24 px-6 max-w-4xl mx-auto text-center relative">
              <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] batik-pattern pointer-events-none"></div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex justify-center gap-4 mb-10 opacity-20">
                  <div className="w-12 h-[1px] bg-[#4a3728] mt-3"></div>
                  <Sparkles size={24} />
                  <div className="w-12 h-[1px] bg-[#4a3728] mt-3"></div>
                </div>

                <p className="italic text-[#4a3728]/90 text-xl md:text-2xl leading-relaxed font-serif-elegant mb-8 px-4">
                  "Ar-Rum : 21 - Dan di antara tanda-tanda (kebesaran)-Nya ialah
                  Dia menciptakan pasangan-pasangan untukmu dari jenismu
                  sendiri, agar kamu cenderung dan merasa tenteram kepadanya."
                </p>
                <div className="h-[1px] w-40 bg-[#c4a484]/50 mx-auto mb-12"></div>

                {aiBlessing && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    className="bg-[#722f37]/5 p-8 md:p-12 rounded-[2.5rem] border border-[#722f37]/10 relative overflow-hidden shadow-sm"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 text-[#722f37]">
                      <Quote size={80} />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[#722f37] mb-6 uppercase tracking-[0.2em] text-xs font-bold">
                      <Sparkles size={14} />
                      <span>Pesan Khusus Untuk {guestName}</span>
                      <Sparkles size={14} />
                    </div>
                    <p className="text-[#4a3728] leading-relaxed italic text-lg md:text-xl font-serif-elegant">
                      "{aiBlessing}"
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </section>

            {/* Couple Profile Section */}
            <section className="py-24 px-6 bg-[#fcfaf2] relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.04] batik-pattern pointer-events-none"></div>
              <div className="max-w-5xl mx-auto relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-16"
                >
                  <p className="font-serif-elegant text-[#8b6e4e] text-sm tracking-[0.4em] uppercase mb-3 italic">
                    Dengan memohon Rahmat dan Ridho Allah SWT
                  </p>
                  <h2 className="font-traditional text-3xl md:text-4xl text-[#4a3728] mb-4">
                    Kedua Mempelai
                  </h2>
                  <div className="w-16 h-[2px] bg-[#c4a484] mx-auto"></div>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 md:gap-16">
                  {/* Bride Card */}
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-white border border-[#c4a484]/30 rounded-[2.5rem] p-10 md:p-12 text-center shadow-xl relative overflow-hidden group hover:shadow-2xl transition-shadow duration-500"
                  >
                    <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#c4a484]/10 rounded-full pointer-events-none"></div>
                    <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#8b6e4e]/5 rounded-full pointer-events-none"></div>

                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#c4a484]/30 to-[#8b6e4e]/20 rounded-full flex items-center justify-center mb-6 border-2 border-[#c4a484]/50 shadow-lg group-hover:scale-105 transition-transform duration-500">
                      <Heart
                        className="text-[#8b6e4e]"
                        size={38}
                        fill="#c4a484"
                        fillOpacity={0.5}
                      />
                    </div>

                    <p className="text-[10px] tracking-[0.4em] uppercase text-[#8b6e4e] font-bold mb-3">
                      Mempelai Wanita
                    </p>
                    <h3 className="font-serif-elegant font-light text-4xl md:text-5xl text-[#4a3728] mb-1 leading-tight tracking-wide">
                      {WEDDING_DATA.bride.name}
                    </h3>
                    <p className="font-serif-elegant font-semibold text-[#4a3728] text-xl mb-6 tracking-wide">
                      {WEDDING_DATA.bride.fullName}
                    </p>

                    <div className="h-[1px] w-20 bg-[#c4a484]/50 mx-auto mb-6"></div>

                    <p className="font-serif-elegant italic text-[#722f37] text-base mb-3">
                      {WEDDING_DATA.bride.childOrder}
                    </p>
                    <p className="text-[#4a3728]/70 text-sm leading-relaxed">
                      Putri dari Bapak{" "}
                      <span className="font-semibold text-[#4a3728]">
                        {WEDDING_DATA.bride.father}
                      </span>
                      <br />
                      &amp; Ibu{" "}
                      <span className="font-semibold text-[#4a3728]">
                        {WEDDING_DATA.bride.mother}
                      </span>
                    </p>
                  </motion.div>

                  {/* Groom Card */}
                  <motion.div
                    initial={{ x: 30, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-white border border-[#c4a484]/30 rounded-[2.5rem] p-10 md:p-12 text-center shadow-xl relative overflow-hidden group hover:shadow-2xl transition-shadow duration-500"
                  >
                    <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#c4a484]/10 rounded-full pointer-events-none"></div>
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#8b6e4e]/5 rounded-full pointer-events-none"></div>

                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#4a3728]/20 to-[#722f37]/20 rounded-full flex items-center justify-center mb-6 border-2 border-[#8b6e4e]/40 shadow-lg group-hover:scale-105 transition-transform duration-500">
                      <Heart
                        className="text-[#722f37]"
                        size={38}
                        fill="#8b6e4e"
                        fillOpacity={0.4}
                      />
                    </div>

                    <p className="text-[10px] tracking-[0.4em] uppercase text-[#8b6e4e] font-bold mb-3">
                      Mempelai Pria
                    </p>
                    <h3 className="font-serif-elegant font-light text-4xl md:text-5xl text-[#4a3728] mb-1 leading-tight tracking-wide">
                      {WEDDING_DATA.groom.name}
                    </h3>
                    <p className="font-serif-elegant font-semibold text-[#4a3728] text-xl mb-6 tracking-wide">
                      {WEDDING_DATA.groom.fullName}
                    </p>

                    <div className="h-[1px] w-20 bg-[#c4a484]/50 mx-auto mb-6"></div>

                    <p className="font-serif-elegant italic text-[#722f37] text-base mb-3">
                      {WEDDING_DATA.groom.childOrder}
                    </p>
                    <p className="text-[#4a3728]/70 text-sm leading-relaxed">
                      Putra dari Bapak{" "}
                      <span className="font-semibold text-[#4a3728]">
                        {WEDDING_DATA.groom.father}
                      </span>
                      <br />
                      &amp; Ibu{" "}
                      <span className="font-semibold text-[#4a3728]">
                        {WEDDING_DATA.groom.mother}
                      </span>
                    </p>
                  </motion.div>
                </div>

                {/* Ampersand Divider */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-center mt-12"
                >
                  <span className="font-script text-7xl text-[#c4a484]/60">
                    &
                  </span>
                </motion.div>
              </div>
            </section>

            {/* Event Details */}
            <section className="py-24 relative overflow-hidden bg-[#722f37] text-white">
              <div className="absolute inset-0 opacity-[0.2] batik-pattern"></div>
              <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                >
                  <h2 className="font-traditional text-4xl mb-16 border-b border-white/20 pb-8 inline-block">
                    Lokasi &amp; Acara
                  </h2>

                  <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                    <div className="bg-white/10 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-white/20 shadow-2xl group hover:bg-white/20 transition-all duration-500">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                        <Calendar size={36} />
                      </div>
                      <h4 className="font-traditional text-3xl mb-6 text-[#fcfaf2]">
                        Akad Nikah
                      </h4>
                      <p className="text-xl font-light mb-2">
                        {WEDDING_DATA.akad.date || "Tanggal akan diumumkan"}
                      </p>
                      <p className="flex items-center justify-center gap-2 mb-8 opacity-80 text-lg">
                        <Clock size={20} />{" "}
                        {WEDDING_DATA.akad.time || "Waktu akan diumumkan"}
                      </p>
                      <div className="h-[1px] bg-white/20 w-full mb-8"></div>
                      <MapPin className="mx-auto mb-3 opacity-50" size={24} />
                      <p className="font-medium text-lg leading-snug mb-2">
                        {WEDDING_DATA.akad.location || "Tempat akan diumumkan"}
                      </p>
                      {WEDDING_DATA.akad.address && (
                        <p className="text-sm opacity-70 italic mt-2">
                          {WEDDING_DATA.akad.address}
                        </p>
                      )}
                      {WEDDING_DATA.akad.mapUrl && (
                        <a
                          href={WEDDING_DATA.akad.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-6 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full text-sm font-bold transition-all"
                        >
                          <MapPin size={16} />
                          Lihat Peta
                        </a>
                      )}
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-white/20 shadow-2xl group hover:bg-white/20 transition-all duration-500">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                        <Heart size={36} />
                      </div>
                      <h4 className="font-traditional text-3xl mb-6 text-[#fcfaf2]">
                        Resepsi
                      </h4>
                      <p className="text-xl font-light mb-2">
                        {WEDDING_DATA.reception.date ||
                          "Tanggal akan diumumkan"}
                      </p>
                      <p className="flex items-center justify-center gap-2 mb-8 opacity-80 text-lg">
                        <Clock size={20} />{" "}
                        {WEDDING_DATA.reception.time || "Waktu akan diumumkan"}
                      </p>
                      <div className="h-[1px] bg-white/20 w-full mb-8"></div>
                      <MapPin className="mx-auto mb-3 opacity-50" size={24} />
                      <p className="font-medium text-lg leading-snug mb-2">
                        {WEDDING_DATA.reception.location ||
                          "Tempat akan diumumkan"}
                      </p>
                      {WEDDING_DATA.reception.address && (
                        <p className="text-sm opacity-70 italic mt-2">
                          {WEDDING_DATA.reception.address}
                        </p>
                      )}
                      {WEDDING_DATA.reception.mapUrl && (
                        <a
                          href={WEDDING_DATA.reception.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-6 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full text-sm font-bold transition-all"
                        >
                          <MapPin size={16} />
                          Lihat Peta
                        </a>
                      )}
                    </div>
                  </div>

                  {(WEDDING_DATA.akad.mapUrl ||
                    WEDDING_DATA.reception.mapUrl) && (
                    <div className="mt-16">
                      <a
                        href={
                          WEDDING_DATA.akad.mapUrl ||
                          WEDDING_DATA.reception.mapUrl
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-4 bg-[#fcfaf2] text-[#722f37] px-12 py-5 rounded-full font-bold shadow-2xl hover:bg-white transition-all transform hover:-translate-y-2 active:scale-95 text-lg"
                      >
                        <MapPin size={24} />
                        Buka Google Maps
                      </a>
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 inline-flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 px-10 py-5 rounded-full shadow-xl"
                  >
                    <Sparkles size={20} className="text-[#c4a484]" />
                    <p className="text-white font-light tracking-widest text-base">
                      Hiburan oleh{" "}
                      <span className="font-bold text-[#c4a484]">
                        Alista Band
                      </span>
                    </p>
                    <Sparkles size={20} className="text-[#c4a484]" />
                  </motion.div>
                </motion.div>
              </div>
            </section>

            {/* Virtual Gift Section */}
            <section className="py-24 bg-white batik-pattern relative overflow-hidden">
              <div className="max-w-4xl mx-auto px-6 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="w-16 h-16 bg-[#8b6e4e]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Gift className="text-[#8b6e4e]" size={32} />
                  </div>
                  <h2 className="font-traditional text-4xl text-[#4a3728] mb-4">
                    Virtual Gift
                  </h2>
                  <div className="w-16 h-[2px] bg-[#c4a484] mx-auto mb-8"></div>
                  <p className="text-[#4a3728]/60 font-serif-elegant italic text-lg mb-12 max-w-lg mx-auto">
                    Doa restu Anda merupakan karunia yang sangat berarti bagi
                    kami. Namun jika memberi adalah bentuk tanda kasih Anda,
                    fitur kado digital ini tersedia untuk Anda.
                  </p>

                  <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {WEDDING_DATA.accounts.map((acc, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        className="bg-[#fcfaf2] border border-[#c4a484]/30 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] -rotate-12">
                          <CreditCard size={100} />
                        </div>
                        <h4 className="font-bold text-[#8b6e4e] text-2xl mb-4 tracking-widest">
                          {acc.bank}
                        </h4>
                        <div className="bg-white/80 p-6 rounded-2xl mb-6 shadow-inner border border-[#c4a484]/10">
                          <p className="text-2xl font-traditional text-[#4a3728] mb-1 tracking-wider">
                            {acc.number}
                          </p>
                          <p className="text-sm text-[#4a3728]/60 uppercase tracking-widest font-medium">
                            a.n {acc.holder}
                          </p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(acc.number)}
                          className="flex items-center justify-center gap-3 w-full bg-[#8b6e4e] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#722f37] transition-all"
                        >
                          {copiedAccount === acc.number ? (
                            <Check size={18} />
                          ) : (
                            <Copy size={18} />
                          )}
                          <span>
                            {copiedAccount === acc.number
                              ? "Tersalin"
                              : "Salin Rekening"}
                          </span>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Guest Book */}
            <section className="py-24 bg-[#fcfaf2] batik-pattern border-t border-[#c4a484]/20">
              <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-16">
                  <MessageCircle
                    className="mx-auto mb-4 text-[#8b6e4e]/60"
                    size={40}
                  />
                  <h2 className="font-traditional text-4xl text-[#4a3728] mb-4">
                    Doa &amp; Ucapan
                  </h2>
                  <div className="w-16 h-[2px] bg-[#c4a484] mx-auto mb-6"></div>
                  <p className="text-[#8b6e4e] font-serif-elegant italic text-lg">
                    Bagikan doa terbaik Anda untuk langkah baru kami
                  </p>
                </div>

                <div className="grid lg:grid-cols-5 gap-12 items-start">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="lg:col-span-2"
                  >
                    <form
                      onSubmit={handleSubmitWish}
                      className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-[#c4a484]/20"
                    >
                      <div className="mb-8 text-left">
                        <label className="block text-xs font-bold text-[#8b6e4e] mb-3 uppercase tracking-[0.2em]">
                          Nama Anda
                        </label>
                        <input
                          type="text"
                          required
                          value={newWish.name}
                          onChange={(e) =>
                            setNewWish({ ...newWish, name: e.target.value })
                          }
                          className="w-full px-5 py-4 rounded-xl border border-[#c4a484]/30 focus:outline-none focus:ring-2 focus:ring-[#8b6e4e]/20 bg-[#fcfaf2]/50 transition-all font-medium text-[#4a3728]"
                          placeholder="Nama lengkap"
                        />
                      </div>
                      <div className="mb-8 text-left">
                        <label className="block text-xs font-bold text-[#8b6e4e] mb-3 uppercase tracking-[0.2em]">
                          Pesan Doa
                        </label>
                        <textarea
                          rows={5}
                          required
                          value={newWish.message}
                          onChange={(e) =>
                            setNewWish({ ...newWish, message: e.target.value })
                          }
                          className="w-full px-5 py-4 rounded-xl border border-[#c4a484]/30 focus:outline-none focus:ring-2 focus:ring-[#8b6e4e]/20 bg-[#fcfaf2]/50 transition-all font-medium text-[#4a3728]"
                          placeholder="Tuliskan harapan indah Anda..."
                        />
                      </div>
                      {!WISHES_API_URL && (
                        <p className="mb-4 text-xs text-[#722f37] bg-[#722f37]/10 border border-[#722f37]/20 rounded-lg p-3 leading-relaxed">
                          Konfigurasi belum lengkap: isi <code>WISHES_API_URL</code> di <code>services/wishesService.ts</code> agar ucapan tersimpan ke Google Sheet.
                        </p>
                      )}
                      {wishesError && (
                        <p className="mb-4 text-xs text-[#722f37] bg-[#722f37]/10 border border-[#722f37]/20 rounded-lg p-3">
                          {wishesError}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={submittingWish || !WISHES_API_URL}
                        className="w-full flex items-center justify-center gap-3 bg-[#8b6e4e] text-white py-5 rounded-xl font-bold shadow-lg hover:bg-[#722f37] transition-all transform active:scale-95 uppercase tracking-widest text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <Send size={20} />
                        {submittingWish ? "Mengirim..." : "Kirim Ucapan"}
                      </button>
                    </form>
                  </motion.div>

                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="lg:col-span-3 space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar"
                  >
                    {wishes.length === 0 ? (
                      <div className="text-center py-24 bg-white/50 rounded-[2.5rem] border-2 border-dashed border-[#c4a484]/30">
                        <Sparkles
                          className="mx-auto mb-4 text-[#c4a484] opacity-30"
                          size={56}
                        />
                        <p className="text-[#4a3728]/40 italic text-lg">
                          Belum ada ucapan tersampaikan...
                        </p>
                      </div>
                    ) : (
                      wishes.map((wish) => (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={wish.id}
                          className="bg-white p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-[#c4a484]/10 relative text-left"
                        >
                          <div className="absolute top-6 right-6 opacity-5">
                            <Heart size={32} />
                          </div>
                          <h4 className="font-bold text-[#4a3728] text-xl mb-1">
                            {wish.name}
                          </h4>
                          <p className="text-[10px] text-[#8b6e4e] mb-4 uppercase tracking-[0.2em] font-bold">
                            {new Date(wish.timestamp).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </p>
                          <p className="text-[#4a3728]/90 italic leading-relaxed text-lg">
                            "{wish.message}"
                          </p>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="py-24 bg-[#4a3728] text-white text-center border-t-[12px] border-[#8b6e4e] relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 batik-pattern pointer-events-none"></div>
              <div className="max-w-3xl mx-auto px-6 relative z-10">
                <h2 className="font-traditional text-5xl md:text-6xl mb-10 text-[#fcfaf2]">
                  {WEDDING_DATA.bride.name} &amp; {WEDDING_DATA.groom.name}
                </h2>
                <div className="h-[1px] w-24 bg-white/20 mx-auto mb-10"></div>
                <p className="font-serif-elegant italic opacity-80 mb-14 text-xl leading-relaxed px-4">
                  "Merupakan suatu kehormatan dan kebahagiaan bagi kami
                  sekeluarga, apabila Bapak/Ibu/Saudara/i berkenan hadir dan
                  memberikan doa restu kepada kedua mempelai."
                </p>
                <div className="w-24 h-24 mx-auto mb-10 border border-white/20 rounded-full flex items-center justify-center shadow-2xl bg-white/5">
                  <Heart fill="#8b6e4e" size={48} className="text-[#8b6e4e]" />
                </div>
                <p className="text-xs tracking-[0.5em] uppercase opacity-40 font-bold mb-6">
                  Terima Kasih
                </p>
                <p className="font-serif-elegant italic opacity-60 text-base mb-4">
                  Hiburan oleh{" "}
                  <span className="font-bold not-italic text-[#c4a484]">
                    Alista Band
                  </span>
                </p>
                <p className="text-[11px] opacity-20 uppercase tracking-[0.3em] font-light">
                  Digital Invitation • Elegansi Tradisi 2026
                </p>
                <p className="text-[10px] opacity-30 uppercase tracking-[0.2em] font-light mt-2">
                  Dibuat oleh{" "}
                  <a
                    href="https://www.instagram.com/uneeddeveloper/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#c4a484] hover:text-[#8b6e4e] transition-colors underline"
                  >
                    uneeddeveloper
                  </a>
                </p>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
