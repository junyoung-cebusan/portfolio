export const locales = ["en", "ja"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ja";

export const messages = {
  en: {
    app: {
      title: "AI Career Agent Dashboard",
      description: "AI Career Agent Dashboard",
    },
    locale: {
      label: "Language",
      english: "EN",
      japanese: "JA",
    },
    common: {
      aiCareerAgent: "AI Career Agent",
      aiAgent: "AI Agent",
      you: "You",
      jd: "JD",
      cv: "CV",
      justNow: "Just now",
      newChat: "New Chat",
      newAnalysis: "New Analysis",
      pastedJobDescription: "Pasted Job Description",
      currentJobDescription: "Current Job Description",
      noJobDescription: "No Job Description",
      noJdSelected: "No JD Selected",
      currentAnalysis: "Current Analysis",
      uploadOrPasteJd: "Upload or paste a JD",
      viewDetail: "View Detail",
      backToChat: "Back to Chat",
      currentJd: "Current JD",
      text: "Text",
      graph: "Graph",
      detailViewMode: "Detail view mode",
      closeSidebar: "Close sidebar",
      openSidebar: "Open sidebar",
      uploadJdToEnableDetail: "Upload a JD to enable detailed analysis",
      createNewAnalysisToStart: "Create a new analysis to start.",
      unsupportedFileUpload: "Uploaded unsupported file",
      uploadedFile: "Uploaded: {fileName}",
    },
    sidebar: {
      assistantSubtitle: "JD Matching Assistant",
      recentSessions: "Recent Sessions",
      chatSessions: "Chat sessions",
      deleteSession: "Delete {title}",
    },
    chat: {
      guidanceDetected:
        "JD detected. Choose an analysis perspective to see your fit score.",
      guidanceStart:
        "To start, please upload a Job Description (PDF/Word) or paste the JD text below.",
      hintActive:
        "Analysis Tools are active. Click a card for structured scoring, or press send for natural chat.",
      hintInactive:
        "Once a JD is detected, the Analysis Tools below will be activated.",
      privacy:
        "Built by <link>Junyoung Hwang</link> for portfolio purposes. For your privacy, all resumes and JDs are processed securely within your browser session and are never saved to our servers.",
      heroDescription:
        "AI-powered JD matching and professional fit analysis for <link>Junyoung Hwang</link>.",
      quickActionQuestion:
        "JD detected. Which perspective should I analyze first?",
      responseFallback: "I could not generate a response. Please try again.",
      aiServiceError:
        "Sorry, I could not reach the AI service. Please try again in a moment.",
      invalidFile: "Sorry, I can only read PDF or .docx files.",
      readingJd: "Reading uploaded JD...",
      jdReady: "JD ready: extracted {count} characters from {fileName}.",
      readDocumentError:
        "Sorry, I could not read that document. Please upload a PDF or .docx file.",
      structuredAnalysisError:
        "Sorry, I could not generate the structured analysis. Please try again in a moment.",
      analyzePrefix: "Analyze: {preset}",
    },
    input: {
      collapse: "Collapse",
      enlarge: "Enlarge",
      collapseMessageInput: "Collapse message input",
      enlargeMessageInput: "Enlarge message input",
      placeholder: "Paste a JD or ask about your career fit...",
      dropFileToUpload: "Drop file to upload",
      uploadInProgress: "Upload in progress",
      pdfOrDocxOnly: "PDF or DOCX only",
      uploadJd: "Upload JD",
      analysisTools: "Analysis Tools",
      openAnalysisTools: "Open analysis tools",
      quickActions: "Quick Actions",
      sendingMessage: "Sending message",
      sendMessage: "Send message",
    },
    display: {
      openSettings: "Open display settings",
      displaySettings: "Display",
      lightMode: "Light mode",
      darkMode: "Dark mode",
      switchToLight: "Switch to light mode",
      switchToDark: "Switch to dark mode",
    },
    errors: {
      aiTimeout:
        "The AI response timed out. Please try a shorter JD or a more focused question.",
      aiInterrupted:
        "The AI response was interrupted before it finished. Please try again.",
      aiRequestFailed: "The AI request failed. Please try again.",
      failedToAnalyze: "Failed to analyze the job description.",
      missingStream: "The analysis response did not include a stream.",
      failedToReadDocument: "Failed to read the uploaded document.",
      failedDetailAnalysis: "Failed to run detail analysis.",
    },
    analysis: {
      generic: {
        fitScore: "Fit Score",
        summary: "Summary",
        matchedSkills: "Matched Skills",
        missingSkills: "Missing Skills",
        analyzing: "Analyzing...",
        noGapsDetected: "No gaps detected yet.",
      },
      categories: {
        techAlignment: {
          title: "Tech Alignment",
          label: "Tech",
          description:
            "Direct JD-to-CV stack overlap with architecture impact proof.",
        },
        domainTransfer: {
          title: "Domain Transfer",
          label: "Domain",
          description:
            "Gap-aware transfer analysis with practical ramp-up proof.",
        },
        featureOwnership: {
          title: "Feature Ownership",
          label: "Ownership",
          description:
            "End-to-end lifecycle ownership and cross-functional delivery.",
        },
        velocity: {
          title: "Velocity",
          fullTitle: "Velocity & Pipeline Acceleration",
          label: "Velocity",
          description:
            "Capacity margin and SDLC pipeline acceleration analysis.",
        },
        risk: {
          title: "Risk",
          label: "Risk",
        },
      },
      presets: {
        match: "{score}% Match",
        alignment: "{score}% Alignment",
        directMatch: "Direct Match",
        strongFit: "Strong Fit",
        strongAlignment: "Strong alignment",
        highVelocity: "High Velocity",
        skillsComparison: "Skills Comparison",
        readyTechStack: "Ready-to-Go Tech Stack",
        jdRequirement: "JD Requirement",
        correlationProof: "Correlation Proof",
        evidence: "Evidence",
        alignmentLabel: "Alignment",
        defaultOwnershipSummary:
          "for senior roles requiring independent decision-making. Your experience matches self-directed leadership and cross-functional coordination.",
        requirementVsCapacity: "Requirement vs. Capacity",
        acceleratedWorkflow: "Accelerated JD Workflow (SDLC)",
        jdContext: "JD Context",
        velocityAccelerator: "Velocity Accelerator: {accelerator}",
        keyVelocityMultipliers: "Key Velocity Multipliers",
        noComparableData: "No comparable data",
        noComparableRequirement: "No comparable {unit} requirement provided",
        exactMatch: "Exact Match: {actual} {unit}",
        noExplicitBaseline:
          "No explicit JD baseline / candidate has {actual} {unit}",
        efficiencySurplus: "+{delta} {unit} Efficiency Surplus",
        learningGap: "{delta} {unit} Learning Gap",
        jdRequirementLabel: "JD Requirement",
        actual: "Actual",
        jdLegend: "JD: {required} {unit}",
        actualLegend: "Actual: {actual} {unit}",
        velocityNote:
          "These factors indicate a fast onboarding process and high throughput, reducing management overhead and dependency delays.",
      },
    },
    detail: {
      jdAnalysis: "JD Analysis",
      correlationNetwork: "Correlation Network",
      graphDescription: "Interactive skill ecosystem visualization",
      connectionBetweenNodes: "Connection between nodes",
      jdRequirements: "JD Requirements",
      aiInsight: "AI Insight",
      correlationProof: "Correlation Proof",
      clickHighlights: "Click highlighted keywords for analysis",
      noHighlights: "No exact JD keyword matches found for detail analysis",
    },
    prompt: {
      outputLanguage: "Output language: English.",
      userFacingStrings:
        "Write every user-facing natural-language string in English.",
      keepKeywords:
        "Keep exact JD keywords verbatim when exact extraction is required.",
      glossary:
        "Terminology glossary: TechAlignment, DomainTransfer, FeatureOwnership, Velocity, Risk, JD Requirement, AI Insight, Correlation Proof, Evidence, Alignment, Fit Score, Matched Skills, Missing Skills.",
    },
  },
  ja: {
    app: {
      title: "AIキャリアエージェントダッシュボード",
      description: "AIキャリアエージェントダッシュボード",
    },
    locale: {
      label: "言語",
      english: "EN",
      japanese: "JA",
    },
    common: {
      aiCareerAgent: "AIキャリアエージェント",
      aiAgent: "AIエージェント",
      you: "あなた",
      jd: "JD",
      cv: "CV",
      justNow: "たった今",
      newChat: "新規チャット",
      newAnalysis: "新規分析",
      pastedJobDescription: "貼り付けた求人要件",
      currentJobDescription: "現在の求人要件",
      noJobDescription: "求人要件なし",
      noJdSelected: "JD未選択",
      currentAnalysis: "現在の分析",
      uploadOrPasteJd: "JDをアップロードまたは貼り付け",
      viewDetail: "詳細を見る",
      backToChat: "チャットへ戻る",
      currentJd: "現在のJD",
      text: "テキスト",
      graph: "グラフ",
      detailViewMode: "詳細表示モード",
      closeSidebar: "サイドバーを閉じる",
      openSidebar: "サイドバーを開く",
      uploadJdToEnableDetail:
        "詳細分析を有効にするにはJDをアップロードしてください",
      createNewAnalysisToStart: "新規分析を作成して開始してください。",
      unsupportedFileUpload: "未対応ファイルをアップロード",
      uploadedFile: "アップロード: {fileName}",
    },
    sidebar: {
      assistantSubtitle: "JDマッチングアシスタント",
      recentSessions: "最近のセッション",
      chatSessions: "チャットセッション",
      deleteSession: "{title}を削除",
    },
    chat: {
      guidanceDetected:
        "JDを検出しました。分析視点を選んで適合スコアを確認してください。",
      guidanceStart:
        "まず求人要件（PDF/Word）をアップロードするか、JD本文を下に貼り付けてください。",
      hintActive:
        "分析ツールが有効です。カードを選ぶと構造化スコア、送信すると自然文チャットになります。",
      hintInactive: "JDが検出されると、下の分析ツールが有効になります。",
      privacy:
        "<link>Junyoung Hwang</link>のポートフォリオとして構築されています。プライバシー保護のため、レジュメとJDはブラウザセッション内で安全に処理され、サーバーには保存されません。",
      heroDescription:
        "AIによる<link>Junyoung Hwang</link>の経歴と募集要項(JD)の適合性分析",
      quickActionQuestion: "JDを検出しました。まずどの視点で分析しますか？",
      responseFallback: "回答を生成できませんでした。もう一度お試しください。",
      aiServiceError:
        "AIサービスに接続できませんでした。少し時間を置いて再試行してください。",
      invalidFile: "PDFまたは.docxファイルのみ読み取れます。",
      readingJd: "アップロードされたJDを読み取り中...",
      jdReady: "JD準備完了: {fileName}から{count}文字を抽出しました。",
      readDocumentError:
        "ドキュメントを読み取れませんでした。PDFまたは.docxファイルをアップロードしてください。",
      structuredAnalysisError:
        "構造化分析を生成できませんでした。少し時間を置いて再試行してください。",
      analyzePrefix: "分析: {preset}",
    },
    input: {
      collapse: "折りたたむ",
      enlarge: "拡大",
      collapseMessageInput: "入力欄を折りたたむ",
      enlargeMessageInput: "入力欄を拡大",
      placeholder: "JDを貼り付けるか、キャリア適合について質問してください...",
      dropFileToUpload: "ファイルをドロップしてアップロード",
      uploadInProgress: "アップロード中",
      pdfOrDocxOnly: "PDFまたはDOCXのみ",
      uploadJd: "JDをアップロード",
      analysisTools: "分析ツール",
      openAnalysisTools: "分析ツールを開く",
      quickActions: "クイックアクション",
      sendingMessage: "送信中",
      sendMessage: "メッセージを送信",
    },
    display: {
      openSettings: "表示設定を開く",
      displaySettings: "表示",
      lightMode: "ライトモード",
      darkMode: "ダークモード",
      switchToLight: "ライトモードに切り替え",
      switchToDark: "ダークモードに切り替え",
    },
    errors: {
      aiTimeout:
        "AI応答がタイムアウトしました。短いJDまたはより絞った質問で再試行してください。",
      aiInterrupted: "AI応答が完了前に中断されました。もう一度お試しください。",
      aiRequestFailed: "AIリクエストに失敗しました。もう一度お試しください。",
      failedToAnalyze: "求人要件の分析に失敗しました。",
      missingStream: "分析レスポンスにストリームが含まれていません。",
      failedToReadDocument:
        "アップロードされたドキュメントの読み取りに失敗しました。",
      failedDetailAnalysis: "詳細分析の実行に失敗しました。",
    },
    analysis: {
      generic: {
        fitScore: "適合スコア",
        summary: "要約",
        matchedSkills: "一致スキル",
        missingSkills: "不足スキル",
        analyzing: "分析中...",
        noGapsDetected: "現時点でギャップは検出されていません。",
      },
      categories: {
        techAlignment: {
          title: "技術適合",
          label: "技術",
          description:
            "JDとCVの技術スタック一致度を、アーキテクチャ影響まで分析します。",
        },
        domainTransfer: {
          title: "ドメイン転用",
          label: "ドメイン",
          description:
            "ギャップを明示し、実務的なキャッチアップ根拠を分析します。",
        },
        featureOwnership: {
          title: "機能オーナーシップ",
          label: "オーナーシップ",
          description:
            "要件整理からリリースまでの自走力と部門横断デリバリーを分析します。",
        },
        velocity: {
          title: "開発速度",
          fullTitle: "開発速度・パイプライン加速",
          label: "速度",
          description: "キャパシティ余力とSDLCパイプライン加速を分析します。",
        },
        risk: {
          title: "リスク",
          label: "リスク",
        },
      },
      presets: {
        match: "{score}% 適合",
        alignment: "{score}% 適合",
        directMatch: "直接一致",
        strongFit: "高い適合",
        strongAlignment: "高い適合",
        highVelocity: "高い開発速度",
        skillsComparison: "スキル比較",
        readyTechStack: "即戦力の技術スタック",
        jdRequirement: "JD要件",
        correlationProof: "相関根拠",
        evidence: "根拠",
        alignmentLabel: "適合度",
        defaultOwnershipSummary:
          "自律的な意思決定が求められるシニアロールに適しています。自走型リードと部門横断調整の経験が一致しています。",
        requirementVsCapacity: "要件とキャパシティ",
        acceleratedWorkflow: "加速されたJDワークフロー（SDLC）",
        jdContext: "JD文脈",
        velocityAccelerator: "開発速度アクセラレーター: {accelerator}",
        keyVelocityMultipliers: "主要な速度向上要因",
        noComparableData: "比較可能なデータなし",
        noComparableRequirement: "比較可能な{unit}要件は提示されていません",
        exactMatch: "完全一致: {actual} {unit}",
        noExplicitBaseline:
          "JDに明示的な基準なし / 候補者は{actual} {unit}を保有",
        efficiencySurplus: "+{delta} {unit}のキャパシティ余力",
        learningGap: "{delta} {unit}の学習ギャップ",
        jdRequirementLabel: "JD要件",
        actual: "実績",
        jdLegend: "JD: {required} {unit}",
        actualLegend: "実績: {actual} {unit}",
        velocityNote:
          "これらの要因は素早いオンボーディングと高いスループットを示し、管理負荷と依存関係による遅延を減らします。",
      },
    },
    detail: {
      jdAnalysis: "JD分析",
      correlationNetwork: "相関ネットワーク",
      graphDescription: "スキルエコシステムのインタラクティブ可視化",
      connectionBetweenNodes: "ノード間の接続",
      jdRequirements: "JD要件",
      aiInsight: "AI洞察",
      correlationProof: "相関根拠",
      clickHighlights: "ハイライトされたキーワードをクリックして分析を確認",
      noHighlights:
        "詳細分析に使える完全一致のJDキーワードは見つかりませんでした",
    },
    prompt: {
      outputLanguage: "出力言語: 日本語。",
      userFacingStrings:
        "JSON内のユーザーに表示される自然文はすべて日本語で書くこと。",
      keepKeywords:
        "JDから抜き出す keyword など、原文一致が要求される値は翻訳しないこと。",
      glossary:
        "用語集: TechAlignment=ドメイン知識の応用力, DomainTransfer=ドメイン知識の応用力, FeatureOwnership=プロダクトオーナーシップ, Velocity=開発パイプラインの高速化, Risk=リスク, JD Requirement=JD要件, AI Insight=AI洞察, Correlation Proof=相関根拠, Evidence=根拠, Alignment=適合度, Fit Score=適合スコア, Matched Skills=一致スキル, Missing Skills=不足スキル。",
    },
  },
} as const;

type WidenMessages<T> = {
  [K in keyof T]: T[K] extends string ? string : WidenMessages<T[K]>;
};

export type Messages = WidenMessages<(typeof messages)[typeof defaultLocale]>;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}

export function getMessages(locale: Locale): (typeof messages)[Locale] {
  return messages[locale];
}
