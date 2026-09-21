export const easeOut = [0.16, 1, 0.3, 1] as const

export const stagger = {
  container: {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.18,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.72, ease: easeOut },
    },
  },
}

export const railStagger = {
  container: {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.05, delayChildren: 0.04 },
    },
  },
  item: {
    hidden: { opacity: 0, x: -12 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.55, ease: easeOut },
    },
  },
}
