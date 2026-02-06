"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation"; // ✅ Next.js router
import React, { useEffect, useRef, useState } from "react";
import { AdminAuth } from "./AdminAuth";
import { CredentialsInfo } from "./CredentialsInfo";
import { ExaminerAuth } from "./ExaminerAuth";
import { InitialAuth } from "./InitialAuth";
import { StudentAuth } from "./StudentAuth";

export const AuthManager: React.FC = () => {
  const { loginWithEmail, loginWithCredentials } = useAuth();
  const router = useRouter(); // ✅ remplacement de useNavigate
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState<
    "initial" | "student" | "examiner" | "admin"
  >("initial");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [isHoverOpen, setIsHoverOpen] = useState(false);
  const [isFocusOpen, setIsFocusOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loaderFinished, setLoaderFinished] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean((window as { __iapauLoaderDone?: boolean }).__iapauLoaderDone);
  });
  const brandRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const runBrandAnimation = () => {
    const el = brandRef.current;
    if (!el) return;
    el.getAnimations().forEach((anim) => anim.cancel());
    el.style.opacity = "0";
    el.style.transform = "translateX(90px)";
    el.style.animation = "none";
    void el.offsetWidth; // force reflow to restart animation
    el.style.animation =
      "studia-slide-in 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.08s forwards";
  };

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!loaderFinished) return;
    runBrandAnimation();
  }, [pathname, loaderFinished]);

  useEffect(() => {
    const handler = () => {
      setLoaderFinished(true);
      runBrandAnimation();
    };
    window.addEventListener("iapau-loading-finished", handler);
    return () => window.removeEventListener("iapau-loading-finished", handler);
  }, []);

  useEffect(() => {
    const update = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (mobile) setIsPinnedOpen(true);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const handleInitialSubmit = async (email: string) => {
    try {
      setEmail(email);
      const userType = await loginWithEmail(email);

      if (!userType) {
        setError("Utilisateur non trouvé");
        return;
      }

      switch (userType) {
        case "student":
          console.log(`Envoi d'un lien magique à ${email}`);
          setCurrentStep("student");
          break;
        case "examiner":
          setCurrentStep("examiner");
          break;
        case "admin":
          setCurrentStep("admin");
          break;
      }
    } catch (err) {
      setError("Une erreur est survenue");
      console.error(err);
    }
  };

  const handleExaminerLogin = async (email: string, password: string) => {
    try {
      await loginWithCredentials(email, password, "examiner");
      router.push("/dashboard/examiner"); // ✅ route correcte
    } catch (err) {
      setError("Email ou mot de passe incorrect");
      console.error(err);
    }
  };

  const handleAdminLogin = async (email: string, password: string) => {
    try {
      await loginWithCredentials(email, password, "admin");
      router.push("/dashboard/admin"); // ✅ route correcte
    } catch (err) {
      setError("Email ou mot de passe incorrect");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F7FB] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(56,189,248,0.18),_transparent_50%),radial-gradient(circle_at_70%_15%,_rgba(56,189,248,0.12),_transparent_55%),radial-gradient(circle_at_65%_90%,_rgba(56,189,248,0.14),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-12 h-72 w-72 rounded-full bg-cyan-400/18 blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-6rem] h-80 w-80 rounded-full bg-cyan-400/14 blur-3xl" />
        <div className="iapau-spot iapau-spot-a" />
        <div className="iapau-spot iapau-spot-b" />
      </div>
      {/* Texte décoratif avec révélation (scan light) */}
      <div className="pointer-events-none select-none absolute right-16 top-1/2 -translate-y-1/2 hidden lg:block">
        <span
          ref={brandRef}
          className="iapau-reveal-wrap studia-hidden text-[120px] font-semibold uppercase tracking-[0.28em]"
        >
          <span className="iapau-reveal-base">
            STUD<span className="studia-ia">IA</span>
          </span>
          <span className="iapau-reveal-scan">
            STUD<span className="studia-ia">IA</span>
          </span>
        </span>
      </div>
      {error && (
        <div className="fixed top-4 left-0 right-0 mx-auto max-w-xs sm:max-w-sm md:max-w-md">
          <div className="relative overflow-hidden rounded-xl border border-red-200 bg-white/95 px-4 py-3 text-red-700 shadow-lg">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-red-300 via-red-500 to-red-300" />
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-8 w-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 text-sm">
                !
              </div>
              <div className="text-sm leading-snug">{error}</div>
              <button
                className="ml-auto text-red-400 hover:text-red-600 transition-colors"
                onClick={() => setError("")}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {(() => {
        const isOpen = isMobile || isPinnedOpen || isHoverOpen || isFocusOpen;
        return (
          <div
            ref={panelRef}
            onMouseEnter={() => setIsHoverOpen(true)}
            onMouseLeave={() => setIsHoverOpen(false)}
            onFocusCapture={() => setIsFocusOpen(true)}
            onBlurCapture={(event) => {
              const next = event.relatedTarget as Node | null;
              if (
                !panelRef.current ||
                !next ||
                !panelRef.current.contains(next)
              ) {
                setIsFocusOpen(false);
              }
            }}
            className={`relative absolute left-4 top-4 bottom-4 sm:left-6 sm:top-6 sm:bottom-auto sm:h-[calc(100vh-48px)] rounded-3xl transition-all duration-300 ease-out overflow-hidden ${
              isReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            } ${
              isOpen
                ? "translate-y-0 bg-white/35 backdrop-blur-xl border border-[#E2E8F0]/60 shadow-[0_34px_90px_-45px_rgba(15,23,42,0.6)] z-30"
                : "bg-transparent border border-transparent shadow-none"
            } motion-reduce:transition-none`}
            style={{
              width: isMobile ? "100%" : isOpen ? "420px" : "60px",
            }}
          >
        <button
          type="button"
          onClick={() => setIsPinnedOpen((prev) => !prev)}
          className={`absolute inset-y-6 right-0 w-[60px] flex flex-col items-center justify-center gap-3 rounded-l-2xl rounded-r-none border border-[#E2E8F0]/90 bg-[#F8FAFC] px-2 py-4 text-[11px] font-semibold text-[#0F172A]/85 shadow-md transition-all duration-300 ease-out hover:bg-white hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.01] hover:ring-2 hover:ring-[#38BDF8]/30 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/35 cursor-pointer z-20 ${
            isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          aria-expanded={isOpen}
        >
          <span className="rotate-180 [writing-mode:vertical-rl] tracking-[0.35em]">
            Connexion
          </span>
          <span
            className={`transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            ▸
          </span>
        </button>
        <div
          className={`absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_30%_20%,_rgba(56,189,248,0.12),_transparent_55%)] transition-all duration-300 ease-out ${
            isOpen ? "opacity-40" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#38BDF8] via-[#0F172A] to-[#0F172A] rounded-t-3xl iapau-accent transition-all duration-300 ease-out ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`relative px-6 pt-14 pb-12 sm:px-8 sm:pt-16 sm:pb-14 space-y-10 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {currentStep === "initial" && (
            <InitialAuth onSubmit={handleInitialSubmit} />
          )}

          {currentStep === "student" && <StudentAuth email={email} />}

          {currentStep === "examiner" && (
            <ExaminerAuth onSubmit={handleExaminerLogin} email={email} />
          )}

          {currentStep === "admin" && (
            <AdminAuth onSubmit={handleAdminLogin} email={email} />
          )}

          <CredentialsInfo />
        </div>
      </div>
        );
      })()}

      {/* Footer discret avec email de support */}
      <footer className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-slate-500/80">
          Besoin d&apos;aide ? Contactez-nous à{" "}
          <a
            href="mailto:support@support.fr"
            className="text-slate-500 hover:text-slate-600 underline"
          >
            support@support.fr
          </a>
        </p>
      </footer>

      {/* Animation "révélation" via gradient animé clipé au texte */}
      <style jsx global>{`
        .iapau-reveal-wrap {
          position: relative;
          display: inline-block;
          color: rgba(56, 189, 248, 0.04);
          font-family: "Inter", "Sora", "Space Grotesk", ui-sans-serif,
            system-ui, sans-serif;
          font-weight: 600;
          text-rendering: geometricPrecision;
        }

        @keyframes studia-slide-in {
          0% {
            opacity: 0;
            transform: translateX(90px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .studia-ia {
          color: rgba(56, 189, 248, 0.9);
          text-shadow: 0 0 6px rgba(56, 189, 248, 0.2);
        }

        .studia-hidden {
          opacity: 0;
          transform: translateX(90px);
        }

        .iapau-reveal-base {
          position: relative;
          color: rgba(56, 189, 248, 0.04);
          font-family: "Inter", "Sora", "Space Grotesk", ui-sans-serif,
            system-ui, sans-serif;
          font-weight: 600;
          text-rendering: geometricPrecision;
          animation: iapau-breathe 10s linear infinite;
        }

        .iapau-reveal-scan {
          position: absolute;
          inset: 0;
          color: rgba(56, 189, 248, 0.16);
          font-family: "Inter", "Sora", "Space Grotesk", ui-sans-serif,
            system-ui, sans-serif;
          font-weight: 600;
          text-rendering: geometricPrecision;
          background-image: linear-gradient(
              25deg,
              rgba(56, 189, 248, 0) 0%,
              rgba(56, 189, 248, 0.55) 48%,
              rgba(56, 189, 248, 0.8) 50%,
              rgba(56, 189, 248, 0.55) 52%,
              rgba(56, 189, 248, 0) 100%
            );
          background-size: 200% 100%;
          background-position: -120% 50%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: iapau-reveal 8s linear infinite;
          text-shadow: none;
        }

        @keyframes iapau-reveal {
          0% {
            background-position: -120% 50%;
          }
          100% {
            background-position: 120% 50%;
          }
        }

        @keyframes iapau-breathe {
          0%,
          100% {
            opacity: 0.04;
          }
          50% {
            opacity: 0.06;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .iapau-slide-in {
            animation: none;
            opacity: 1;
            transform: none;
          }
          .iapau-reveal-scan {
            animation: none;
          }
          .iapau-reveal-base {
            animation: none;
          }
          .iapau-accent::after {
            animation: none;
          }
          .iapau-spot {
            animation: none;
          }
        }

        @media (max-width: 1023px) {
          .iapau-reveal-wrap {
            display: none;
          }
        }

        .iapau-accent {
          position: relative;
          overflow: hidden;
        }

        .iapau-accent::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.35) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: translateX(-120%);
          animation: accent-shine 12s ease-in-out infinite;
        }

        @keyframes accent-shine {
          0%,
          70% {
            transform: translateX(-120%);
          }
          85% {
            transform: translateX(120%);
          }
          100% {
            transform: translateX(120%);
          }
        }

        .iapau-spot {
          position: absolute;
          border-radius: 999px;
          filter: blur(60px);
          opacity: 0.14;
          background: radial-gradient(
            circle,
            rgba(56, 189, 248, 0.55),
            rgba(56, 189, 248, 0)
          );
          animation: iapau-spot-move 24s ease-in-out infinite;
        }

        .iapau-spot-a {
          width: 420px;
          height: 420px;
          left: -120px;
          top: 20%;
        }

        .iapau-spot-b {
          width: 520px;
          height: 520px;
          right: -160px;
          bottom: -80px;
          animation-delay: 6s;
          opacity: 0.12;
        }

        @keyframes iapau-spot-move {
          0% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(40px, -30px, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </div>
  );
};
