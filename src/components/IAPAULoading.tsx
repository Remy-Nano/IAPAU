"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./IAPAULoading.module.css";

type IAPAULoadingProps = {
  isLoading: boolean;
};

export default function IAPAULoading({ isLoading }: IAPAULoadingProps) {
  const [visible, setVisible] = useState(isLoading);
  const [logoError, setLogoError] = useState(false);
  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setIsZooming(false);
      return;
    }

    setIsZooming(true);
    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    const zoomTimer = setTimeout(() => {
      setIsZooming(false);
      hideTimer = setTimeout(() => setVisible(false), 250);
    }, 900);

    return () => {
      clearTimeout(zoomTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div
      className={`${styles.overlay} ${isLoading ? styles.show : styles.hide} ${
        isZooming ? styles.zooming : ""
      }`}
      aria-busy={isLoading}
      aria-live="polite"
    >
      <div className={styles.logoWrap}>
        <div className={styles.logoHalo} />
        <div className={styles.logoSolo}>
          <Image
            className={styles.logoImage}
            src="/ia-pau-logo.png?v=3"
            alt="Studia"
            width={170}
            height={170}
            onError={() => setLogoError(true)}
          />
        </div>
        <div className={styles.loadingLine}>
          <div className={styles.loadingLineFill} />
        </div>
        {logoError && (
          <div className={styles.logoStatusError}>Logo introuvable</div>
        )}
      </div>
    </div>
  );
}
