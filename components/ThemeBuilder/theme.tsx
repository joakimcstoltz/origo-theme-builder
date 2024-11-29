"use client";

import {
    adjustHue,
    darken,
    getContrast,
    getLuminance,
    hslToColorString,
    mix,
    lighten,
    parseToHsl,
    invert,
    setLightness,
} from "polished";
import Icon from "./../Icons/Icon";
import React, { useEffect, useRef, useState, type FC } from "react";
import { BlockPicker } from "react-color";
import styles from "./theme.module.scss";
import styled from "styled-components";

const hexRegex = /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/;

const colorWhite = "#ffffff";
const colorBlack = "#000000";
const baseColorSuccess = "#008000";
const baseColorWarning = "#ffff00";
const baseColorError = "#ff0000";

const colorAdjustment = (
    color: string,
    background: string,
    darkmode: boolean = false,
    minContrast: number = 4.5,
): string => {
    let adjustedColor = color;
    let ratio = getContrast(adjustedColor, background);

    const maxAdjustments = 0.2;
    let adjustmentStep = 0.01;
    let iteration = 0;

    const lightenOrDarken = (color: string, step: number) => {
        return darkmode ? lighten(step, color) : darken(step, color);
    };

    while (ratio < minContrast && iteration < 100) {
        adjustedColor = lightenOrDarken(adjustedColor, adjustmentStep);
        ratio = getContrast(adjustedColor, background);

        adjustmentStep = Math.min(adjustmentStep * 2, maxAdjustments);
        iteration++;
    }

    return adjustedColor;
};

const hoverColor = (color: string) => {
    return mix(0.2, getLuminance(color) > 0.5 ? colorBlack : colorWhite, color);
};

type ThemeProps = {
    inputColor?: string;
    colorScheme?: "default" | "triadic" | "split";
};

type ColorMode = {
    light: string;
    dark: string;
};

const ThemeBuilder: FC<ThemeProps> = ({
    inputColor: initialInputColor = "#CB9CF2",
    colorScheme: innitialColorScheme = "default",
}) => {
    const [inputColor, setInputColor] = useState<string>(initialInputColor);
    const [darkmode, setDarkmode] = useState<boolean>(false);

    const colorPickerRef = useRef<HTMLInputElement>(null);

    const [colorPrimary, setColorPrimary] = useState<ColorMode>({
        light: initialInputColor,
        dark: initialInputColor,
    });
    const [colorBackground, setColorBackground] = useState<ColorMode>({
        light: mix(0.95, colorWhite, initialInputColor),
        dark: mix(0.95, colorBlack, initialInputColor),
    });
    const [colorText, setColorText] = useState<ColorMode>({
        light: mix(0.99, colorBlack, initialInputColor),
        dark: mix(0.99, colorWhite, initialInputColor),
    });

    const [colorSecondary, setColorSecondary] = useState<ColorMode | undefined>(
        undefined,
    );
    const [colorAccent, setColorAccent] = useState<ColorMode | undefined>(
        undefined,
    );
    const [colorSuccess, setColorSuccess] = useState<ColorMode | undefined>(
        undefined,
    );
    const [colorWarning, setColorWarning] = useState<ColorMode | undefined>(
        undefined,
    );
    const [colorError, setColorError] = useState<ColorMode | undefined>(
        undefined,
    );

    const [displayColorText, setDisplayColorText] = useState<boolean>(false);
    const [showShades, setShowShades] = useState<boolean>(false);

    const [colorScheme, setColorScheme] =
        useState<ThemeProps["colorScheme"]>(innitialColorScheme);

    const [showSettings, setShowSettings] = useState<boolean>(false);

    const handleSettingsChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setShowSettings(event.target.checked);
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            const formattedColor = inputColor.startsWith("#")
                ? inputColor
                : `#${inputColor}`;

            if (hexRegex.test(formattedColor)) {
                const { hue, saturation, lightness } =
                    parseToHsl(formattedColor);

                let lightBackground, darkBackground;

                if (saturation < 0.1) {
                    if (lightness <= 0.05) {
                        lightBackground = mix(0.95, colorWhite, formattedColor);
                        darkBackground = mix(
                            0.95,
                            colorBlack,
                            invert(formattedColor),
                        );
                    } else if (lightness >= 0.95) {
                        lightBackground = mix(
                            0.95,
                            colorWhite,
                            invert(formattedColor),
                        );
                        darkBackground = mix(0.95, colorBlack, formattedColor);
                    } else if (lightness <= 0.5) {
                        lightBackground = mix(0.95, colorWhite, formattedColor);
                        darkBackground = mix(
                            0.95,
                            colorBlack,
                            lighten(0.25, formattedColor),
                        );
                    } else {
                        lightBackground = mix(
                            0.95,
                            colorWhite,
                            darken(0.25, formattedColor),
                        );
                        darkBackground = mix(0.95, colorBlack, formattedColor);
                    }
                } else {
                    lightBackground = mix(0.95, colorWhite, formattedColor);
                    darkBackground = mix(0.95, colorBlack, formattedColor);
                }

                setColorBackground({
                    light: lightBackground,
                    dark: darkBackground,
                });

                let lightPrimary, darkPrimary;

                if (saturation < 0.1) {
                    lightPrimary =
                        lightness > 0.6
                            ? invert(formattedColor)
                            : lightness < 0.4
                              ? formattedColor
                              : invert(formattedColor);

                    darkPrimary =
                        lightness > 0.6
                            ? formattedColor
                            : lightness < 0.4
                              ? invert(formattedColor)
                              : formattedColor;

                    if (lightness >= 0.4 && lightness <= 0.6) {
                        lightPrimary =
                            getContrast(lightPrimary, lightBackground) < 4.5
                                ? darken(0.1, lightPrimary)
                                : lightPrimary;

                        darkPrimary =
                            getContrast(darkPrimary, darkBackground) < 4.5
                                ? lighten(0.1, darkPrimary)
                                : darkPrimary;
                    }
                } else {
                    lightPrimary =
                        getContrast(formattedColor, lightBackground) >= 4.5
                            ? formattedColor
                            : colorAdjustment(
                                  formattedColor,
                                  lightBackground,
                                  false,
                              );
                    darkPrimary =
                        getContrast(formattedColor, darkBackground) >= 4.5
                            ? formattedColor
                            : colorAdjustment(
                                  formattedColor,
                                  darkBackground,
                                  true,
                              );
                }

                setColorPrimary({ light: lightPrimary, dark: darkPrimary });

                setColorText({
                    light: mix(0.99, colorWhite, lightPrimary),
                    dark: mix(0.99, colorBlack, darkPrimary),
                });

                let secondaryHue, accentHue;

                switch (colorScheme) {
                    case "default":
                        secondaryHue = 30;
                        accentHue = 180;
                        break;
                    case "triadic":
                        secondaryHue = 120;
                        accentHue = 240;
                        break;
                    case "split":
                        secondaryHue = 150;
                        accentHue = 210;
                        break;
                    default:
                        secondaryHue = 30;
                        accentHue = 180;
                }

                let lightSecondary, darkSecondary, lightAccent, darkAccent;

                if (saturation < 0.1) {
                    const lightPrimaryHSL = parseToHsl(lightPrimary);
                    const darkPrimaryHSL = parseToHsl(darkPrimary);
                    const lightBackgroundHSL = parseToHsl(lightBackground);
                    const darkBackgroundHSL = parseToHsl(darkBackground);

                    const clampLightness = (value: number) =>
                        Math.max(0, Math.min(1, value));

                    if (lightness >= 0.4 && lightness <= 0.6) {
                        const adjustSecondary = 0.15;
                        const adjustAccent = adjustSecondary * 2;

                        lightSecondary = setLightness(
                            clampLightness(
                                lightBackgroundHSL.lightness >= 0.5
                                    ? lightPrimaryHSL.lightness -
                                          adjustSecondary
                                    : lightPrimaryHSL.lightness +
                                          adjustSecondary,
                            ),
                            lightPrimary,
                        );

                        darkSecondary = setLightness(
                            clampLightness(
                                darkBackgroundHSL.lightness <= 0.5
                                    ? darkPrimaryHSL.lightness + adjustSecondary
                                    : darkPrimaryHSL.lightness -
                                          adjustSecondary,
                            ),
                            darkPrimary,
                        );

                        lightAccent = setLightness(
                            clampLightness(
                                lightBackgroundHSL.lightness >= 0.5
                                    ? lightPrimaryHSL.lightness - adjustAccent
                                    : lightPrimaryHSL.lightness + adjustAccent,
                            ),
                            lightPrimary,
                        );

                        darkAccent = setLightness(
                            clampLightness(
                                darkBackgroundHSL.lightness <= 0.5
                                    ? darkPrimaryHSL.lightness + adjustAccent
                                    : darkPrimaryHSL.lightness - adjustAccent,
                            ),
                            darkPrimary,
                        );
                    } else if (
                        (lightness >= 0.25 && lightness < 0.4) ||
                        (lightness > 0.6 && lightness <= 0.75)
                    ) {
                        const adjustSecondary = 0.15;
                        const adjustAccent = adjustSecondary * 2;

                        lightSecondary =
                            getContrast(
                                lighten(adjustSecondary, lightPrimary),
                                lightBackground,
                            ) >
                            getContrast(
                                darken(adjustSecondary, lightPrimary),
                                lightBackground,
                            )
                                ? lighten(adjustSecondary, lightPrimary)
                                : darken(adjustSecondary, lightPrimary);

                        darkSecondary =
                            getContrast(
                                lighten(adjustSecondary, darkPrimary),
                                darkBackground,
                            ) >
                            getContrast(
                                darken(adjustSecondary, darkPrimary),
                                darkBackground,
                            )
                                ? lighten(adjustSecondary, darkPrimary)
                                : darken(adjustSecondary, darkPrimary);

                        lightAccent =
                            getContrast(
                                lighten(adjustAccent, lightPrimary),
                                lightBackground,
                            ) >
                            getContrast(
                                darken(adjustAccent, lightPrimary),
                                lightBackground,
                            )
                                ? lighten(adjustAccent, lightPrimary)
                                : darken(adjustAccent, lightPrimary);

                        darkAccent =
                            getContrast(
                                lighten(adjustAccent, darkPrimary),
                                darkBackground,
                            ) >
                            getContrast(
                                darken(adjustAccent, darkPrimary),
                                darkBackground,
                            )
                                ? lighten(adjustAccent, darkPrimary)
                                : darken(adjustAccent, darkPrimary);
                    } else {
                        const adjustSecondary = 0.1;
                        const adjustAccent = adjustSecondary * 2;

                        lightSecondary =
                            lightPrimaryHSL.lightness < 0.4
                                ? lighten(adjustSecondary, lightPrimary)
                                : darken(adjustSecondary, lightPrimary);

                        darkSecondary =
                            darkPrimaryHSL.lightness < 0.4
                                ? lighten(adjustSecondary, darkPrimary)
                                : darken(adjustSecondary, darkPrimary);

                        lightAccent =
                            lightPrimaryHSL.lightness < 0.4
                                ? lighten(adjustAccent, lightPrimary)
                                : darken(adjustAccent, lightPrimary);

                        darkAccent =
                            darkPrimaryHSL.lightness < 0.4
                                ? lighten(adjustAccent, darkPrimary)
                                : darken(adjustAccent, darkPrimary);
                    }
                } else {
                    lightSecondary = colorAdjustment(
                        adjustHue(secondaryHue, lightPrimary),
                        lightBackground,
                        false,
                    );
                    darkSecondary = colorAdjustment(
                        adjustHue(-secondaryHue, darkPrimary),
                        darkBackground,
                        true,
                    );
                    lightAccent = colorAdjustment(
                        adjustHue(accentHue, lightPrimary),
                        lightBackground,
                        false,
                    );
                    darkAccent = colorAdjustment(
                        adjustHue(-accentHue, darkPrimary),
                        darkBackground,
                        true,
                    );
                }

                setColorSecondary({
                    light: lightSecondary,
                    dark: darkSecondary,
                });

                setColorAccent({
                    light: lightAccent,
                    dark: darkAccent,
                });

                const setStatusColor = (
                    color: string,
                    darkmode: boolean = false,
                ) => {
                    return mix(
                        0.8,
                        color,
                        darkmode ? darkPrimary : lightPrimary,
                    );
                };

                const lightSuccess = setStatusColor(baseColorSuccess);
                const darkSuccess = setStatusColor(baseColorSuccess, true);

                setColorSuccess({
                    light:
                        getContrast(lightSuccess, lightBackground) < 4.5
                            ? colorAdjustment(
                                  lightSuccess,
                                  lightBackground,
                                  false,
                              )
                            : lightSuccess,
                    dark:
                        getContrast(darkSuccess, darkBackground) < 4.5
                            ? colorAdjustment(darkSuccess, darkBackground, true)
                            : darkSuccess,
                });

                const lightWarningHSL = parseToHsl(
                    setStatusColor(baseColorWarning),
                );

                const adjustLightWarning = {
                    ...lightWarningHSL,
                    hue: 15,
                    saturation:
                        lightWarningHSL.saturation < 0.5
                            ? Math.min(lightWarningHSL.saturation + 0.1, 1)
                            : Math.max(lightWarningHSL.saturation - 0.1, 0),
                };

                const lightWarning = hslToColorString(adjustLightWarning);
                const darkWarning = setStatusColor(baseColorWarning, true);

                setColorWarning({
                    light:
                        getContrast(lightWarning, lightBackground) < 4.5
                            ? colorAdjustment(
                                  lightWarning,
                                  lightBackground,
                                  false,
                              )
                            : lightWarning,
                    dark:
                        getContrast(darkWarning, darkBackground) < 4.5
                            ? colorAdjustment(darkWarning, darkBackground, true)
                            : darkWarning,
                });

                const lightError = setStatusColor(baseColorError);
                const darkError = setStatusColor(baseColorError, true);

                setColorError({
                    light:
                        getContrast(lightError, lightBackground) < 4.5
                            ? colorAdjustment(
                                  lightError,
                                  lightBackground,
                                  false,
                              )
                            : lightError,
                    dark:
                        getContrast(darkError, darkBackground) < 4.5
                            ? colorAdjustment(darkError, darkBackground, true)
                            : darkError,
                });
            }
        }, 300);

        return () => clearTimeout(debounce);
    }, [inputColor, colorScheme]);

    useEffect(() => {
        const documentBody = document.querySelector("body");
        if (documentBody) {
            documentBody.style.setProperty(
                "--background",
                darkmode ? colorBackground.dark : colorBackground.light,
            );
        }
    }, [darkmode, colorBackground]);

    const handleColorChange = (color: any) => {
        setInputColor(color.hex);
        if (colorPickerRef.current) {
            colorPickerRef.current.checked = false;
        }
    };

    const generateRandomColor = () => {
        let randomColor = `#${Math.floor(Math.random() * 0xffffff)
            .toString(16)
            .padStart(6, "0")}`;
        setInputColor(randomColor);
    };

    const adjustTextColor = (
        color: string,
        background: string,
        mode: "lighten" | "darken",
    ): string => {
        const minContrast = 4.5;
        let adjustedColor = color;
        let ratio = getContrast(adjustedColor, background);

        const adjustments = 0.2;
        let steps = 0.1;
        let iterations = 0;

        const determineMode = (color: string, step: number) => {
            return mode === "lighten"
                ? lighten(step, color)
                : darken(step, color);
        };

        while (ratio < minContrast && iterations < 100) {
            adjustedColor = determineMode(adjustedColor, adjustments);
            ratio = getContrast(adjustedColor, background);

            steps = Math.min(steps * 2, adjustments);
            iterations++;
        }

        return adjustedColor;
    };

    const textColor = (color: string) => {
        const minContrast = 4.5;
        const lightContrast = getContrast(colorWhite, color);
        const darkContrast = getContrast(colorBlack, color);

        if (lightContrast >= minContrast && darkContrast >= minContrast) {
            if (lightContrast > darkContrast) {
                return colorText.light;
            } else {
                return colorText.dark;
            }
        } else if (lightContrast >= minContrast) {
            return colorText.light;
        } else if (darkContrast >= minContrast) {
            return colorText.dark;
        } else {
            if (getLuminance(color) > 0.5) {
                return adjustTextColor(colorWhite, color, "darken");
            } else {
                return adjustTextColor(colorBlack, color, "lighten");
            }
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setDisplayColorText(true);
        setTimeout(() => {
            setDisplayColorText(false);
        }, 400);
    };

    const displayShades = () => {
        setShowShades(!showShades);
    };

    const renderButton = (
        color: ColorMode | undefined,
        text: string,
        onClick: () => void,
    ) => {
        const colorBase = darkmode
            ? color?.dark ?? colorBlack
            : color?.light ?? colorWhite;

        const StyledButton = styled.button`
            --font-size: calc(1rem * 0.875);
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: ${colorBase};
            color: ${textColor(colorBase)};
            font-size: calc(1rem * 0.875);
            line-height: 1;
            padding: var(--font-size) 1.25rem;
            border-radius: calc((var(--font-size) * 3) / 2);
            cursor: pointer;
            gap: var(--font-size);
            transition: background-color 0.3s ease;

            &:hover {
                background-color: ${hoverColor(colorBase)};
            }
        `;

        return <StyledButton onClick={onClick}>{text}</StyledButton>;
    };

    const renderColorScheme = (name: ThemeProps["colorScheme"]) => {
        const colorBase =
            colorScheme === name
                ? darkmode
                    ? colorPrimary.dark
                    : colorPrimary.light
                : darkmode
                  ? mix(0.3, inputColor, colorBackground.dark)
                  : mix(0.15, inputColor, colorBackground.light);

        return (
            <>
                <input
                    type="radio"
                    id={`color-scheme-${name}`}
                    name="color-scheme"
                    onClick={() => setColorScheme(name)}
                />
                <label
                    htmlFor={`color-scheme-${name}`}
                    style={{
                        backgroundColor: colorBase,
                        color: textColor(colorBase),
                    }}
                >
                    {name!.charAt(0).toUpperCase() + name!.slice(1)}
                </label>
            </>
        );
    };

    const renderColor = (
        color: ColorMode | undefined,
        name: string,
        isText: boolean = false,
    ) => {
        const colorBase = darkmode
            ? isText
                ? color?.light ?? colorWhite
                : color?.dark ?? colorBlack
            : isText
              ? color?.dark ?? colorBlack
              : color?.light ?? colorWhite;

        return (
            <div
                className={styles.colors}
                style={{
                    color: darkmode ? colorText.light : colorText.dark,
                }}
            >
                <span className={styles.colorsContrast}>
                    {getContrast(
                        colorBase,
                        darkmode ? colorBackground.dark : colorBackground.light,
                    )}
                    <Icon
                        type={
                            getContrast(
                                colorBase,
                                darkmode
                                    ? colorBackground.dark
                                    : colorBackground.light,
                            )
                                ? "check"
                                : "cancel"
                        }
                        color={
                            getContrast(
                                colorBase,
                                darkmode
                                    ? colorBackground.dark
                                    : colorBackground.light,
                            )
                                ? darkmode
                                    ? colorSuccess?.dark
                                    : colorSuccess?.light
                                : darkmode
                                  ? colorError?.dark
                                  : colorError?.light
                        }
                    />
                </span>
                {showShades ? (
                    <div className={styles.colorsShades}>
                        {Array.from({ length: 9 }, (_, i) => {
                            const mixValue = (i + 1) * 0.1;
                            const shade = mix(
                                mixValue,
                                darkmode ? colorBlack : colorWhite,
                                colorBase,
                            );

                            return (
                                <button
                                    key={i}
                                    style={{
                                        backgroundColor: shade,
                                        color: textColor(shade),
                                    }}
                                    data-label={
                                        displayColorText
                                            ? "Copied!"
                                            : "Copy color"
                                    }
                                    onClick={() => copyToClipboard(shade)}
                                >
                                    <span>{shade}</span>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <button
                        className={styles.colorsButton}
                        data-label={displayColorText ? "Copied!" : "Copy color"}
                        style={{
                            backgroundColor: colorBase,
                            color: textColor(colorBase),
                        }}
                        onClick={() => copyToClipboard(colorBase)}
                    >
                        <span>{colorBase}</span>
                    </button>
                )}
                <p>{name}</p>
            </div>
        );
    };

    return (
        <div className={styles.main}>
            <div className={styles.paletteController}>
                <div className={styles.paletteControllerContainer}>
                    <div className={styles.colorPicker}>
                        <input
                            type="checkbox"
                            ref={colorPickerRef}
                            id="color-picker"
                        />
                        <label
                            htmlFor="color-picker"
                            style={{
                                backgroundColor: darkmode
                                    ? mix(
                                          0.1,
                                          colorPrimary.dark,
                                          colorBackground.dark,
                                      )
                                    : mix(
                                          0.1,
                                          colorPrimary.light,
                                          colorBackground.light,
                                      ),
                                color: darkmode
                                    ? colorText.light
                                    : colorText.dark,
                            }}
                        >
                            {inputColor}
                            <span
                                style={{
                                    backgroundColor: darkmode
                                        ? colorPrimary.dark
                                        : colorPrimary.light,
                                }}
                            />
                        </label>
                        <div className={styles.colorPickerDropdown}>
                            <BlockPicker
                                color={inputColor}
                                onChangeComplete={handleColorChange}
                                styles={{
                                    default: {
                                        card: {
                                            backgroundColor: darkmode
                                                ? colorBackground.dark
                                                : colorBackground.light,
                                        },
                                        input: {
                                            backgroundColor: darkmode
                                                ? colorBackground.dark
                                                : colorBackground.light,
                                            color: darkmode
                                                ? colorText.light
                                                : colorText.dark,
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>
                    {renderButton(
                        colorPrimary,
                        "Random Color",
                        generateRandomColor,
                    )}
                </div>
                <div className={styles.paletteControllerContainer}>
                    <div
                        className={styles.colorScheme}
                        style={{
                            backgroundColor: darkmode
                                ? mix(0.3, inputColor, colorBackground.dark)
                                : mix(0.15, inputColor, colorBackground.light),
                        }}
                    >
                        {renderColorScheme("default")}
                        {renderColorScheme("triadic")}
                        {renderColorScheme("split")}
                    </div>
                </div>
                <div className={styles.paletteControllerContainer}>
                    <div
                        className={styles.paletteControllerInfo}
                        style={{
                            backgroundColor: darkmode
                                ? mix(0.05, colorWhite, colorBackground.dark)
                                : mix(0.05, colorBlack, colorBackground.light),
                            color: darkmode ? colorText.light : colorText.dark,
                        }}
                        onClick={() =>
                            copyToClipboard(
                                darkmode
                                    ? colorBackground.dark
                                    : colorBackground.light,
                            )
                        }
                        data-label={displayColorText ? "Copied!" : "Copy color"}
                    >
                        <span>
                            {darkmode
                                ? colorBackground.dark
                                : colorBackground.light}
                        </span>
                    </div>
                    {renderButton(
                        colorPrimary,
                        showShades
                            ? "Show color"
                            : darkmode
                              ? "Show shades"
                              : "Show tints",
                        displayShades,
                    )}
                    <div className={styles.toggle}>
                        <input
                            type="checkbox"
                            id="toggle"
                            onClick={() => setDarkmode((prev) => !prev)}
                        />
                        <label
                            htmlFor="toggle"
                            style={{
                                backgroundColor: darkmode
                                    ? mix(0.3, inputColor, colorBackground.dark)
                                    : mix(
                                          0.15,
                                          inputColor,
                                          colorBackground.light,
                                      ),
                                color: darkmode
                                    ? mix(0.3, inputColor, colorBackground.dark)
                                    : mix(
                                          0.15,
                                          inputColor,
                                          colorBackground.light,
                                      ),
                            }}
                        >
                            <span className={styles.toggleIcons}>
                                <Icon type="sun" />
                                <Icon type="moon" />
                            </span>
                            <span
                                className={styles.toggleButton}
                                style={{
                                    backgroundColor: darkmode
                                        ? colorPrimary.dark
                                        : colorPrimary.light,
                                }}
                            />
                        </label>
                    </div>
                </div>
            </div>
            <div className={styles.paletteContent}>
                {renderColor(colorPrimary, "Primary")}
                {renderColor(colorSecondary, "Secondary")}
                {renderColor(colorAccent, "Accent")}
                {renderColor(colorText, "Text", true)}
                {renderColor(colorSuccess, "Success")}
                {renderColor(colorWarning, "Warning")}
                {renderColor(colorError, "Error")}
            </div>
            <div className={styles.settings}>
                <input
                    type="checkbox"
                    id="settings"
                    checked={showSettings}
                    onChange={handleSettingsChange}
                />
                <label
                    htmlFor="settings"
                    style={{
                        backgroundColor: showSettings
                            ? darkmode
                                ? hoverColor(colorPrimary.dark)
                                : hoverColor(colorPrimary.light)
                            : darkmode
                              ? colorPrimary.dark
                              : colorPrimary.light,
                        color: darkmode
                            ? textColor(colorPrimary.dark)
                            : textColor(colorPrimary.light),
                    }}
                >
                    <Icon type={showSettings ? "cancel" : "settings"} />
                </label>
                <div
                    className={styles.settingsContent}
                    style={{
                        backgroundColor: darkmode
                            ? colorBackground.dark
                            : colorBackground.light,
                    }}
                >
                    <div
                        className={styles.settingsInfo}
                        style={{
                            backgroundColor: darkmode
                                ? mix(0.05, colorWhite, colorBackground.dark)
                                : mix(0.05, colorBlack, colorBackground.light),
                            color: darkmode ? colorText.light : colorText.dark,
                        }}
                        onClick={() =>
                            copyToClipboard(
                                darkmode
                                    ? colorBackground.dark
                                    : colorBackground.light,
                            )
                        }
                        data-label={displayColorText ? "Copied!" : "Copy color"}
                    >
                        <span>
                            {darkmode
                                ? colorBackground.dark
                                : colorBackground.light}
                        </span>
                    </div>
                    <div
                        className={styles.select}
                        style={{
                            backgroundColor: darkmode
                                ? mix(0.05, colorWhite, colorBackground.dark)
                                : mix(0.05, colorBlack, colorBackground.light),
                            color: darkmode ? colorText.light : colorText.dark,
                        }}
                    >
                        <select
                            style={{
                                color: darkmode
                                    ? colorText.light
                                    : colorText.dark,
                            }}
                            onChange={(e) =>
                                setColorScheme(
                                    e.target.value === "default"
                                        ? "default"
                                        : e.target.value === "triadic"
                                          ? "triadic"
                                          : "split",
                                )
                            }
                        >
                            <option value="default">Default</option>
                            <option value="triadic">Triadic</option>
                            <option value="split">Split</option>
                        </select>
                        <Icon type="caretDown" />
                    </div>
                    {renderButton(
                        colorSecondary,
                        "Random Color",
                        generateRandomColor,
                    )}
                    {renderButton(
                        colorPrimary,
                        showShades
                            ? "Show color"
                            : darkmode
                              ? "Show shades"
                              : "Show tints",
                        displayShades,
                    )}
                </div>
            </div>
        </div>
    );
};

export default ThemeBuilder;
