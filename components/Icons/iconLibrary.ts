import { CaretDown, Check, GearSix, Moon, Sun, X } from "@phosphor-icons/react";

export const iconLibrary = {
    cancel: X,
    caretDown: CaretDown,
    check: Check,
    moon: Moon,
    sun: Sun,
    settings: GearSix,
};

export type IconLibrary = keyof typeof iconLibrary;
