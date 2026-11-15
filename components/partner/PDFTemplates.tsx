import React from 'react';
import {
    Document,
    Image,
    Page,
    StyleSheet,
    Text,
    View,
} from '@react-pdf/renderer';

interface TemplateProps {
    clinicName: string;
    brandColor: string;
    title: string;
    body: string;
    modality: string;
    logoUrl?: string | null;
    qrCodeUrl?: string | null;
    backgroundImage?: string | null;
    theme?: string;
}

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#ffffff',
        color: '#0f172a',
        position: 'relative',
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    backgroundOverlayLight: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.90)',
    },
    backgroundOverlayDark: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(15,23,42,0.56)',
    },
    topBar: {
        paddingHorizontal: 36,
        paddingVertical: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    badge: {
        fontSize: 10,
        letterSpacing: 2,
        textTransform: 'uppercase',
        fontWeight: 700,
    },
    brandMark: {
        fontSize: 11,
        letterSpacing: 3,
        textTransform: 'uppercase',
        fontWeight: 700,
    },
    posterBody: {
        paddingHorizontal: 36,
        paddingTop: 12,
        paddingBottom: 120,
        flex: 1,
        justifyContent: 'space-between',
    },
    posterHero: {
        borderRadius: 18,
        overflow: 'hidden',
        minHeight: 260,
        position: 'relative',
        marginBottom: 26,
    },
    posterHeroFill: {
        width: '100%',
        height: 260,
        objectFit: 'cover',
    },
    posterHeroFallback: {
        height: 260,
        padding: 28,
        justifyContent: 'space-between',
    },
    heroTag: {
        fontSize: 10,
        letterSpacing: 2,
        textTransform: 'uppercase',
        fontWeight: 700,
    },
    clinicName: {
        fontSize: 12,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 10,
        fontWeight: 700,
    },
    title: {
        fontSize: 28,
        lineHeight: 1.2,
        fontWeight: 700,
        marginBottom: 14,
    },
    body: {
        fontSize: 12,
        lineHeight: 1.65,
        color: '#334155',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 36,
        paddingVertical: 22,
        backgroundColor: '#f8fafc',
        borderTop: '1 solid #e2e8f0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
    },
    disclaimer: {
        fontSize: 8,
        lineHeight: 1.5,
        color: '#64748b',
        maxWidth: '72%',
    },
    qrWrap: {
        width: 72,
        height: 72,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1 solid #cbd5e1',
        overflow: 'hidden',
    },
    qrImage: {
        width: 64,
        height: 64,
    },
    socialPage: {
        position: 'relative',
        justifyContent: 'space-between',
    },
    socialContent: {
        paddingHorizontal: 72,
        paddingVertical: 48,
        flex: 1,
        justifyContent: 'space-between',
    },
    socialTitle: {
        fontSize: 42,
        lineHeight: 1.18,
        fontWeight: 700,
        marginBottom: 18,
    },
    storyTitle: {
        fontSize: 54,
        lineHeight: 1.14,
        fontWeight: 700,
        marginBottom: 24,
    },
    socialBody: {
        fontSize: 18,
        lineHeight: 1.6,
        maxWidth: '92%',
    },
    storyBody: {
        fontSize: 24,
        lineHeight: 1.55,
        maxWidth: '88%',
    },
    bottomCard: {
        padding: 24,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.88)',
    },
    storyBottomCard: {
        padding: 26,
        borderRadius: 24,
        backgroundColor: 'rgba(15,23,42,0.68)',
        border: '1 solid rgba(255,255,255,0.12)',
    },
    socialDisclaimer: {
        fontSize: 10,
        lineHeight: 1.5,
        color: '#64748b',
        marginTop: 14,
    },
    storyDisclaimer: {
        fontSize: 13,
        lineHeight: 1.5,
        color: 'rgba(226,232,240,0.88)',
        marginTop: 18,
    },
    storyClinicName: {
        fontSize: 14,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: '#e2e8f0',
        marginBottom: 12,
        fontWeight: 700,
    },
    logo: {
        width: 96,
        height: 56,
        objectFit: 'contain',
        marginBottom: 16,
    },
    storyLogo: {
        width: 132,
        height: 72,
        objectFit: 'contain',
        marginBottom: 26,
    },
});

const getDisclaimer = (modality: string) => {
    switch (modality) {
        case 'HBOT':
            return 'Guided HBOT content is for wellness education only. It is not medical advice and is not a substitute for assessment by a qualified healthcare professional.';
        case 'PEMF':
            return 'PEMF content is presented in a wellness context only. It is not medical advice and is not a substitute for assessment by a qualified healthcare professional.';
        case 'RLT':
            return 'Red light content is for general wellbeing education only. It is not medical advice and is not a substitute for assessment by a qualified healthcare professional.';
        case 'Hydrogen':
            return 'Hydrogen wellness content is educational and complementary in nature. It is not medical advice and is not a substitute for assessment by a qualified healthcare professional.';
        default:
            return 'This asset is for wellness education only. It is not medical advice and is not a substitute for assessment by a qualified healthcare professional.';
    }
};

const getThemePalette = (theme: string | undefined, brandColor: string) => {
    if (theme === 'luxury') {
        return {
            surface: '#fffaf4',
            surfaceMuted: '#f6eee4',
            ink: '#2b2118',
            copy: '#5f4a3b',
            badge: '#8f5b2e',
            accent: brandColor,
        };
    }

    if (theme === 'bold') {
        return {
            surface: '#0f172a',
            surfaceMuted: '#111827',
            ink: '#f8fafc',
            copy: '#cbd5e1',
            badge: '#38bdf8',
            accent: brandColor,
        };
    }

    return {
        surface: '#ffffff',
        surfaceMuted: '#f8fafc',
        ink: '#0f172a',
        copy: '#334155',
        badge: '#0f172a',
        accent: brandColor,
    };
};

const PosterTemplateBase: React.FC<TemplateProps> = ({
    clinicName,
    brandColor,
    title,
    body,
    modality,
    logoUrl,
    qrCodeUrl,
    backgroundImage,
    theme,
}) => {
    const palette = getThemePalette(theme, brandColor);

    return (
        <Document>
            <Page size="A4" style={[styles.page, { backgroundColor: palette.surface }]}>
                <View
                    style={[
                        styles.topBar,
                        {
                            borderBottom: `1 solid ${theme === 'bold' ? '#1e293b' : '#e2e8f0'}`,
                            backgroundColor: theme === 'bold' ? palette.surfaceMuted : '#ffffff',
                        },
                    ]}
                >
                    <Text style={[styles.badge, { color: palette.badge }]}>
                        Hylono verified technology
                    </Text>
                    <Text style={[styles.brandMark, { color: palette.ink }]}>Studio asset</Text>
                </View>

                <View style={styles.posterBody}>
                    <View>
                        <View
                            style={[
                                styles.posterHero,
                                backgroundImage
                                    ? {}
                                    : {
                                          backgroundColor:
                                              theme === 'luxury' ? palette.surfaceMuted : '#e0f2fe',
                                      },
                            ]}
                        >
                            {backgroundImage ? (
                                <Image src={backgroundImage} style={styles.posterHeroFill} />
                            ) : (
                                <View
                                    style={[
                                        styles.posterHeroFallback,
                                        {
                                            backgroundColor:
                                                theme === 'bold' ? '#082f49' : palette.surfaceMuted,
                                        },
                                    ]}
                                >
                                    <Text style={[styles.heroTag, { color: palette.accent }]}>
                                        {modality} campaign
                                    </Text>
                                    <Text
                                        style={[
                                            styles.title,
                                            {
                                                marginBottom: 0,
                                                color: theme === 'bold' ? '#f8fafc' : palette.ink,
                                            },
                                        ]}
                                    >
                                        Brand-safe artwork preview
                                    </Text>
                                </View>
                            )}
                        </View>

                        {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
                        <Text style={[styles.clinicName, { color: palette.accent }]}>
                            {clinicName}
                        </Text>
                        <Text style={[styles.title, { color: palette.ink }]}>{title}</Text>
                        <Text style={[styles.body, { color: palette.copy }]}>{body}</Text>
                    </View>
                </View>

                <View
                    style={[
                        styles.footer,
                        {
                            backgroundColor: theme === 'bold' ? '#111827' : '#f8fafc',
                            borderTopColor: theme === 'bold' ? '#1f2937' : '#e2e8f0',
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.disclaimer,
                            { color: theme === 'bold' ? '#cbd5e1' : '#64748b' },
                        ]}
                    >
                        {getDisclaimer(modality)}
                    </Text>
                    <View style={styles.qrWrap}>
                        {qrCodeUrl ? (
                            <Image src={qrCodeUrl} style={styles.qrImage} />
                        ) : (
                            <Text style={{ fontSize: 8, color: '#64748b' }}>Add booking URL</Text>
                        )}
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export const A4PosterTemplate: React.FC<TemplateProps> = (props) => (
    <PosterTemplateBase {...props} />
);

export const SocialSquareTemplate: React.FC<TemplateProps> = ({
    clinicName,
    brandColor,
    title,
    body,
    modality,
    logoUrl,
    qrCodeUrl,
    backgroundImage,
    theme,
}) => {
    const palette = getThemePalette(theme, brandColor);

    return (
        <Document>
            <Page
                size={[1080, 1080]}
                style={[styles.socialPage, { backgroundColor: palette.surface }]}
            >
                {backgroundImage ? <Image src={backgroundImage} style={styles.backgroundImage} /> : null}
                {backgroundImage ? <View style={styles.backgroundOverlayLight} /> : null}

                <View style={styles.socialContent}>
                    <View>
                        <Text style={[styles.badge, { color: palette.accent, marginBottom: 20 }]}>
                            Hylono verified technology
                        </Text>
                        {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
                        <Text style={[styles.clinicName, { color: palette.accent }]}>
                            {clinicName}
                        </Text>
                        <Text style={[styles.socialTitle, { color: palette.ink }]}>{title}</Text>
                        <Text style={[styles.socialBody, { color: palette.copy }]}>{body}</Text>
                    </View>

                    <View style={styles.bottomCard}>
                        <Text
                            style={{
                                fontSize: 11,
                                textTransform: 'uppercase',
                                letterSpacing: 2,
                                color: palette.accent,
                                fontWeight: 700,
                            }}
                        >
                            {modality} partner campaign
                        </Text>
                        <Text style={styles.socialDisclaimer}>{getDisclaimer(modality)}</Text>
                        {qrCodeUrl ? (
                            <View style={[styles.qrWrap, { marginTop: 16 }]}>
                                <Image src={qrCodeUrl} style={styles.qrImage} />
                            </View>
                        ) : null}
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export const SocialStoryTemplate: React.FC<TemplateProps> = ({
    clinicName,
    brandColor,
    title,
    body,
    modality,
    logoUrl,
    qrCodeUrl,
    backgroundImage,
    theme,
}) => {
    const palette = getThemePalette(theme, brandColor);

    return (
        <Document>
            <Page size={[1080, 1920]} style={[styles.socialPage, { backgroundColor: '#020617' }]}>
                {backgroundImage ? <Image src={backgroundImage} style={styles.backgroundImage} /> : null}
                <View style={styles.backgroundOverlayDark} />

                <View style={[styles.socialContent, { paddingTop: 88, paddingBottom: 72 }]}>
                    <View>
                        <Text style={[styles.badge, { color: '#bae6fd', marginBottom: 26 }]}>
                            Hylono verified technology
                        </Text>
                        {logoUrl ? <Image src={logoUrl} style={styles.storyLogo} /> : null}
                        <Text style={styles.storyClinicName}>{clinicName}</Text>
                        <Text style={[styles.storyTitle, { color: '#f8fafc' }]}>{title}</Text>
                        <Text style={[styles.storyBody, { color: '#e2e8f0' }]}>{body}</Text>
                    </View>

                    <View style={styles.storyBottomCard}>
                        <Text
                            style={{
                                fontSize: 12,
                                letterSpacing: 2,
                                textTransform: 'uppercase',
                                color: brandColor || palette.accent,
                                fontWeight: 700,
                            }}
                        >
                            {modality} studio export
                        </Text>
                        <Text style={styles.storyDisclaimer}>{getDisclaimer(modality)}</Text>
                        {qrCodeUrl ? (
                            <View
                                style={[
                                    styles.qrWrap,
                                    {
                                        marginTop: 18,
                                        width: 108,
                                        height: 108,
                                        backgroundColor: '#ffffff',
                                    },
                                ]}
                            >
                                <Image src={qrCodeUrl} style={{ width: 96, height: 96 }} />
                            </View>
                        ) : null}
                    </View>
                </View>
            </Page>
        </Document>
    );
};
