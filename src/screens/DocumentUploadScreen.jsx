import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { colors, spacing, fonts, typography, radius } from '../theme';
import { extractPrescriptionFromImage, extractLabFromImage, extractLabFromText } from '../lib/groq';
import { extractTextFromPdfBase64 } from '../lib/pdfText';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
function KindButton({
  label,
  sub,
  selected,
  onPress
}) {
  return /*#__PURE__*/_jsxs(TouchableOpacity, {
    style: [styles.kindBtn, selected && styles.kindBtnActive],
    onPress: onPress,
    activeOpacity: 0.8,
    children: [/*#__PURE__*/_jsx(Text, {
      style: [styles.kindLabel, selected && styles.kindLabelActive],
      children: label
    }), /*#__PURE__*/_jsx(Text, {
      style: [styles.kindSub, selected && styles.kindSubActive],
      children: sub
    })]
  });
}
function SourceButton({
  label,
  sub,
  onPress
}) {
  return /*#__PURE__*/_jsxs(TouchableOpacity, {
    style: styles.sourceBtn,
    onPress: onPress,
    activeOpacity: 0.8,
    children: [/*#__PURE__*/_jsx(Text, {
      style: styles.sourceBtnLabel,
      children: label
    }), /*#__PURE__*/_jsx(Text, {
      style: styles.sourceBtnSub,
      children: sub
    })]
  });
}
export default function DocumentUploadScreen({
  navigation,
  route
}) {
  const person = route?.params?.person;
  const [docKind, setDocKind] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = (extracted, kind, filename) => {
    navigation.navigate('DocumentReview', {
      person,
      docKind: kind,
      extracted,
      filename
    });
  };
  const handleError = err => {
    setProcessing(false);
    setStatusMsg('');
    const msg = err?.message ?? String(err);
    console.error('[DocumentUpload]', msg);
    setErrorMsg(msg);
  };
  const processImage = async (base64, mimeType, kind) => {
    setProcessing(true);
    setStatusMsg('Extracting with AI…');
    try {
      if (kind === 'prescription') {
        const meds = await extractPrescriptionFromImage(base64, mimeType);
        if (!meds.length) {
          throw new Error('No medications found. Make sure the prescription is in frame and well-lit.');
        }
        navigate(meds, 'prescription');
      } else {
        const lab = await extractLabFromImage(base64, mimeType);
        if (!lab.tests?.length) {
          throw new Error('No test results found. Make sure all rows are visible and in focus.');
        }
        navigate(lab, 'lab_report');
      }
    } catch (e) {
      handleError(e);
    }
  };
  const processPdf = async (uri, name) => {
    setProcessing(true);
    setStatusMsg('Reading PDF…');
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64'
      });
      const text = extractTextFromPdfBase64(base64);
      setStatusMsg('Extracting with AI…');
      const lab = await extractLabFromText(text);
      if (!lab.tests?.length) {
        throw new Error('No lab values found in this PDF. It may be a scanned document — try taking a photo of each page instead.');
      }
      navigate(lab, 'lab_report', name);
    } catch (e) {
      handleError(e);
    }
  };
  const pickCamera = async () => {
    setErrorMsg(null);
    if (!docKind) {
      Alert.alert('Select document type first');
      return;
    }
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera permission required', 'Allow camera access in Settings to use this feature.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      base64: true
    });
    if (!result.canceled && result.assets[0]?.base64) {
      const mimeType = result.assets[0].uri.endsWith('.png') ? 'image/png' : 'image/jpeg';
      await processImage(result.assets[0].base64, mimeType, docKind);
    }
  };
  const pickLibrary = async () => {
    setErrorMsg(null);
    if (!docKind) {
      Alert.alert('Select document type first');
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photo library permission required', 'Allow photo access in Settings to use this feature.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      base64: true
    });
    if (!result.canceled && result.assets[0]?.base64) {
      const mimeType = result.assets[0].uri.endsWith('.png') ? 'image/png' : 'image/jpeg';
      await processImage(result.assets[0].base64, mimeType, docKind);
    }
  };
  const pickPdf = async () => {
    setErrorMsg(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true
    });
    if (result.canceled || !result.assets?.[0]) return;
    const {
      uri,
      name
    } = result.assets[0];
    await processPdf(uri, name ?? 'lab_report.pdf');
  };
  if (processing) {
    return /*#__PURE__*/_jsx(SafeAreaView, {
      style: styles.safe,
      children: /*#__PURE__*/_jsxs(View, {
        style: styles.processingWrap,
        children: [/*#__PURE__*/_jsx(ActivityIndicator, {
          size: "large",
          color: colors.forestDeep
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.processingMsg,
          children: statusMsg
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.processingHint,
          children: "This usually takes 5\u201315 seconds"
        })]
      })
    });
  }
  return /*#__PURE__*/_jsxs(SafeAreaView, {
    style: styles.safe,
    children: [/*#__PURE__*/_jsxs(View, {
      style: styles.topBar,
      children: [/*#__PURE__*/_jsx(TouchableOpacity, {
        onPress: () => navigation.goBack(),
        children: /*#__PURE__*/_jsx(Text, {
          style: styles.back,
          children: "\u2190 Back"
        })
      }), /*#__PURE__*/_jsx(Text, {
        style: styles.topTitle,
        children: "Upload document"
      }), /*#__PURE__*/_jsx(View, {
        style: {
          width: 60
        }
      })]
    }), /*#__PURE__*/_jsxs(ScrollView, {
      contentContainerStyle: styles.content,
      showsVerticalScrollIndicator: false,
      children: [person?.name && /*#__PURE__*/_jsxs(Text, {
        style: styles.forPerson,
        children: ["For ", person.name]
      }), /*#__PURE__*/_jsx(Text, {
        style: styles.sectionHeading,
        children: "What are you uploading?"
      }), /*#__PURE__*/_jsxs(View, {
        style: styles.kindRow,
        children: [/*#__PURE__*/_jsx(KindButton, {
          label: "Prescription",
          sub: "Medication slip from a doctor",
          selected: docKind === 'prescription',
          onPress: () => setDocKind('prescription')
        }), /*#__PURE__*/_jsx(KindButton, {
          label: "Lab Report",
          sub: "Blood work, urine, or other tests",
          selected: docKind === 'lab_report',
          onPress: () => setDocKind('lab_report')
        })]
      }), /*#__PURE__*/_jsx(Text, {
        style: [styles.sectionHeading, {
          marginTop: spacing.xl
        }],
        children: "Choose source"
      }), /*#__PURE__*/_jsx(Text, {
        style: styles.sectionHint,
        children: docKind === 'lab_report' ? 'Use PDF for digital lab exports. Use Camera or Library for printed reports.' : 'Take a photo or choose one from your library.'
      }), /*#__PURE__*/_jsxs(View, {
        style: styles.sourceList,
        children: [/*#__PURE__*/_jsx(SourceButton, {
          label: "Take Photo",
          sub: "Use camera to capture document",
          onPress: pickCamera
        }), /*#__PURE__*/_jsx(View, {
          style: styles.sourceDivider
        }), /*#__PURE__*/_jsx(SourceButton, {
          label: "Photo Library",
          sub: "Choose an existing photo",
          onPress: pickLibrary
        }), docKind === 'lab_report' || docKind === null ? /*#__PURE__*/_jsxs(_Fragment, {
          children: [/*#__PURE__*/_jsx(View, {
            style: styles.sourceDivider
          }), /*#__PURE__*/_jsx(SourceButton, {
            label: "PDF File",
            sub: "Import a PDF from Files app",
            onPress: pickPdf
          })]
        }) : null]
      }), errorMsg && /*#__PURE__*/_jsxs(View, {
        style: styles.errorBox,
        children: [/*#__PURE__*/_jsx(Text, {
          style: styles.errorTitle,
          children: "Could not process document"
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.errorMsg,
          children: errorMsg
        }), /*#__PURE__*/_jsx(TouchableOpacity, {
          onPress: () => setErrorMsg(null),
          children: /*#__PURE__*/_jsx(Text, {
            style: styles.errorDismiss,
            children: "Dismiss"
          })
        })]
      }), /*#__PURE__*/_jsxs(View, {
        style: styles.tipBox,
        children: [/*#__PURE__*/_jsx(Text, {
          style: styles.tipTitle,
          children: "For best results"
        }), /*#__PURE__*/_jsx(Text, {
          style: styles.tipText,
          children: "Lay the document flat, use good lighting, and make sure all text is in frame and in focus."
        })]
      })]
    })]
  });
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.white
  },
  back: {
    ...typography.body,
    color: colors.forest,
    width: 60
  },
  topTitle: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.forestDeep,
    letterSpacing: -0.3
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 60
  },
  forPerson: {
    ...typography.caption,
    color: colors.muted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: spacing.lg
  },
  sectionHeading: {
    fontFamily: fonts.serif,
    fontSize: 20,
    fontWeight: '400',
    color: colors.forestDeep,
    letterSpacing: -0.3,
    marginBottom: spacing.md
  },
  sectionHint: {
    ...typography.bodySmall,
    color: colors.muted,
    marginBottom: spacing.md,
    lineHeight: 18
  },
  kindRow: {
    flexDirection: 'row',
    gap: 10
  },
  kindBtn: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
    padding: spacing.md,
    gap: 4
  },
  kindBtnActive: {
    borderColor: colors.forestDeep,
    backgroundColor: colors.forestDeep
  },
  kindLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: -0.1
  },
  kindLabelActive: {
    color: '#fff'
  },
  kindSub: {
    fontSize: 11,
    color: colors.muted,
    lineHeight: 15
  },
  kindSubActive: {
    color: 'rgba(255,255,255,0.7)'
  },
  sourceList: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden'
  },
  sourceDivider: {
    height: 1,
    backgroundColor: colors.line,
    marginHorizontal: spacing.md
  },
  sourceBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg
  },
  sourceBtnLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.forestDeep,
    letterSpacing: -0.1
  },
  sourceBtnSub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2
  },
  errorBox: {
    marginTop: spacing.lg,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: '#FDEDEC',
    borderWidth: 1,
    borderColor: '#C0392B22'
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C0392B',
    marginBottom: 4
  },
  errorMsg: {
    fontSize: 12,
    color: '#7B1B1B',
    lineHeight: 17
  },
  errorDismiss: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C0392B',
    marginTop: 8
  },
  tipBox: {
    marginTop: spacing.xl,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.sageSoft
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.forest,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 4
  },
  tipText: {
    fontSize: 13,
    color: colors.forest,
    lineHeight: 18
  },
  processingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md
  },
  processingMsg: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.forestDeep,
    letterSpacing: -0.3
  },
  processingHint: {
    fontSize: 13,
    color: colors.muted
  }
});