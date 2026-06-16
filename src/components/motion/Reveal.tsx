"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";

interface RevealProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  delay?: number;
  distance?: number;
}

export function Reveal({
  children,
  className,
  delay = 0,
  distance = 24,
  ...props
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: distance }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={reduceMotion ? undefined : { once: true, amount: 0.2 }}
      transition={
        reduceMotion
          ? undefined
          : { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  delay?: number;
}

export function StaggerGroup({
  children,
  className,
  delay = 0,
  ...props
}: StaggerProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "show"}
      viewport={reduceMotion ? undefined : { once: true, amount: 0.15 }}
      variants={
        reduceMotion
          ? undefined
          : {
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: delay,
                },
              },
            }
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...props
}: Omit<HTMLMotionProps<"div">, "children"> & { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={
        reduceMotion
          ? undefined
          : {
              hidden: { opacity: 0, y: 18 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
              },
            }
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}
