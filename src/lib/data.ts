// This file contains the dummy data for the application

export const allResults = [
  {
    id: 1,
    name: 'Twitter',
    url: 'twitter.com',
    lastAnalyzed: '2023-11-15',
    views: 1250,
    docType: ['tos'],
    logo: '/placeholder.svg?height=48&width=48',
    tos_link: 'https://twitter.com/tos',
    pp_link: '',
    tos_summarization: {
      one_sentence:
        "Twitter's Terms of Service grant them broad rights to user content while limiting liability.",
      hundred_words:
        "Twitter's Terms of Service establish a comprehensive legal framework that heavily favors the platform. Users grant Twitter an extensive license to their content, allowing the company to use, modify, and distribute it across their services. The terms permit Twitter to collect vast amounts of user data for advertising and product improvement.",
    },
    pp_summarization: {
      one_sentence: '',
      hundred_words: '',
    },
    tos_text_mining: {
      word_count: 5842,
      avg_word_length: 5.1,
      sentence_count: 389,
      avg_sentence_length: 15.0,
      readability_score: 42.3, // Flesch-Kincaid score (lower = harder to read)
      unique_word_ratio: 0.28,
      capital_letter_frequency: 0.11,
      punctuation_density: 0.09,
      question_frequency: 0.02,
      paragraph_count: 98,
    },
    pp_text_mining: {
      word_count: 0,
      avg_word_length: 0,
      sentence_count: 0,
      avg_sentence_length: 0,
      readability_score: 0,
      unique_word_ratio: 0,
      capital_letter_frequency: 0,
      punctuation_density: 0,
      question_frequency: 0,
      paragraph_count: 0,
    },
    tos_word_frequency: [
      { word: 'content', count: 76 },
      { word: 'service', count: 68 },
      { word: 'twitter', count: 62 },
      { word: 'use', count: 57 },
      { word: 'information', count: 49 },
      { word: 'account', count: 43 },
      { word: 'may', count: 38 },
      { word: 'services', count: 35 },
      { word: 'terms', count: 32 },
      { word: 'rights', count: 29 },
    ],
    pp_word_frequency: [],
  },
  {
    id: 2,
    name: 'Facebook',
    url: 'facebook.com',
    lastAnalyzed: '2023-11-10',
    views: 2340,
    docType: ['tos', 'pp'],
    logo: '/placeholder.svg?height=48&width=48',
    tos_link: 'https://www.facebook.com/terms.php',
    pp_link: 'https://www.facebook.com/privacy/policy/',
    tos_summarization: {
      one_sentence:
        "Facebook's Terms of Service grant them extensive rights to user content and allow them to modify the service without notice.",
      hundred_words:
        "Facebook's Terms of Service establish a comprehensive legal framework that heavily favors the platform. Users grant Facebook an extensive license to their content, allowing the company to use, modify, and distribute it across their services. The company reserves the right to modify the service or terms at any time with minimal notice. The agreement includes mandatory arbitration clauses that limit users' ability to pursue legal action.",
    },
    pp_summarization: {
      one_sentence:
        'Facebook collects extensive user data across platforms for targeted advertising and personalization.',
      hundred_words:
        "Facebook's Privacy Policy allows extensive data collection across platforms, sharing with third parties, and targeted advertising while providing limited user control over personal information. They track your activities on and off Facebook, including your location, device information, and interactions with other websites and apps that use their services.",
    },
    tos_text_mining: {
      word_count: 4250,
      avg_word_length: 5.2,
      sentence_count: 275,
      avg_sentence_length: 15.5,
      readability_score: 39.2,
      unique_word_ratio: 0.26,
      capital_letter_frequency: 0.12,
      punctuation_density: 0.08,
      question_frequency: 0.02,
      paragraph_count: 78,
    },
    pp_text_mining: {
      word_count: 2834,
      avg_word_length: 5.4,
      sentence_count: 177,
      avg_sentence_length: 16.0,
      readability_score: 38.0,
      unique_word_ratio: 0.24,
      capital_letter_frequency: 0.12,
      punctuation_density: 0.08,
      question_frequency: 0.04,
      paragraph_count: 46,
    },
    tos_word_frequency: [
      { word: 'content', count: 52 },
      { word: 'service', count: 48 },
      { word: 'facebook', count: 45 },
      { word: 'use', count: 38 },
      { word: 'terms', count: 32 },
      { word: 'account', count: 28 },
      { word: 'may', count: 25 },
      { word: 'services', count: 22 },
      { word: 'rights', count: 20 },
      { word: 'provide', count: 18 },
    ],
    pp_word_frequency: [
      { word: 'information', count: 58 },
      { word: 'data', count: 53 },
      { word: 'facebook', count: 42 },
      { word: 'use', count: 36 },
      { word: 'privacy', count: 35 },
      { word: 'share', count: 32 },
      { word: 'collect', count: 30 },
      { word: 'provide', count: 24 },
      { word: 'personal', count: 22 },
      { word: 'third-party', count: 18 },
    ],
  },
  {
    id: 3,
    name: 'Instagram',
    url: 'instagram.com',
    lastAnalyzed: '2023-11-05',
    views: 1890,
    docType: ['pp'],
    logo: '/placeholder.svg?height=48&width=48',
    tos_link: '',
    pp_link: 'https://help.instagram.com/519522125107875',
    tos_summarization: {
      one_sentence: '',
      hundred_words: '',
    },
    pp_summarization: {
      one_sentence:
        "Instagram's Privacy Policy allows them to collect and share user data across Meta platforms.",
      hundred_words:
        "Instagram's Privacy Policy outlines extensive data collection practices that extend beyond the platform itself. The company collects information about your activities on third-party websites, apps, and devices. This data is used for targeted advertising, content personalization, and product development.",
    },
    tos_text_mining: {
      word_count: 0,
      avg_word_length: 0,
      sentence_count: 0,
      avg_sentence_length: 0,
      readability_score: 0,
      unique_word_ratio: 0,
      capital_letter_frequency: 0,
      punctuation_density: 0,
      question_frequency: 0,
      paragraph_count: 0,
    },
    pp_text_mining: {
      word_count: 6235,
      avg_word_length: 5.2,
      sentence_count: 412,
      avg_sentence_length: 15.1,
      readability_score: 39.8,
      unique_word_ratio: 0.26,
      capital_letter_frequency: 0.11,
      punctuation_density: 0.08,
      question_frequency: 0.02,
      paragraph_count: 108,
    },
    tos_word_frequency: [],
    pp_word_frequency: [
      { word: 'information', count: 92 },
      { word: 'data', count: 78 },
      { word: 'instagram', count: 65 },
      { word: 'use', count: 59 },
      { word: 'content', count: 54 },
      { word: 'services', count: 48 },
      { word: 'privacy', count: 43 },
      { word: 'share', count: 39 },
      { word: 'meta', count: 36 },
      { word: 'collect', count: 32 },
    ],
  },
  {
    id: 4,
    name: 'Spotify',
    url: 'spotify.com',
    lastAnalyzed: '2023-10-28',
    views: 980,
    docType: ['pp'],
    logo: '/placeholder.svg?height=48&width=48',
    tos_link: '',
    pp_link: 'https://www.spotify.com/us/legal/privacy-policy/',
    tos_summarization: {
      one_sentence: '',
      hundred_words: '',
    },
    pp_summarization: {
      one_sentence:
        'Spotify collects listening data to personalize recommendations and for advertising.',
      hundred_words:
        "Spotify's Privacy Policy details how they collect and use your listening history, search queries, and device information to personalize your experience and serve targeted advertisements. They share data with advertisers, partners, and service providers.",
    },
    tos_text_mining: {
      word_count: 0,
      avg_word_length: 0,
      sentence_count: 0,
      avg_sentence_length: 0,
      readability_score: 0,
      unique_word_ratio: 0,
      capital_letter_frequency: 0,
      punctuation_density: 0,
      question_frequency: 0,
      paragraph_count: 0,
    },
    pp_text_mining: {
      word_count: 5128,
      avg_word_length: 5.0,
      sentence_count: 342,
      avg_sentence_length: 15.0,
      readability_score: 41.2,
      unique_word_ratio: 0.27,
      capital_letter_frequency: 0.1,
      punctuation_density: 0.07,
      question_frequency: 0.02,
      paragraph_count: 89,
    },
    tos_word_frequency: [],
    pp_word_frequency: [
      { word: 'data', count: 83 },
      { word: 'spotify', count: 72 },
      { word: 'information', count: 65 },
      { word: 'use', count: 58 },
      { word: 'service', count: 52 },
      { word: 'personal', count: 47 },
      { word: 'privacy', count: 41 },
      { word: 'content', count: 36 },
      { word: 'collect', count: 32 },
      { word: 'share', count: 29 },
    ],
  },
  {
    id: 5,
    name: 'Netflix',
    url: 'netflix.com',
    lastAnalyzed: '2023-10-22',
    views: 1560,
    docType: ['tos', 'pp'],
    logo: '/placeholder.svg?height=48&width=48',
    tos_link: 'https://help.netflix.com/legal/termsofuse',
    pp_link: 'https://help.netflix.com/legal/privacy',
    tos_summarization: {
      one_sentence:
        "Netflix's terms include mandatory arbitration and limitations on class action lawsuits.",
      hundred_words:
        "Netflix's Terms of Service establish a comprehensive legal framework that heavily favors the platform. The terms include mandatory arbitration clauses that limit users' ability to pursue legal action. Netflix reserves the right to modify the service or terms at any time with minimal notice. Users grant Netflix extensive rights to use their viewing data for personalization and service improvement.",
    },
    pp_summarization: {
      one_sentence:
        'Netflix collects viewing history and preferences to personalize content recommendations.',
      hundred_words:
        "Netflix's Privacy Policy outlines how they collect viewing history, preferences, and device information to personalize content recommendations. They track your interactions with the platform, including what you watch, when you watch it, and how you navigate the service. This data is used to improve their recommendation algorithms and may be shared with service providers and partners.",
    },
    tos_text_mining: {
      word_count: 2950,
      avg_word_length: 5.0,
      sentence_count: 198,
      avg_sentence_length: 14.9,
      readability_score: 41.2,
      unique_word_ratio: 0.29,
      capital_letter_frequency: 0.1,
      punctuation_density: 0.08,
      question_frequency: 0.01,
      paragraph_count: 52,
    },
    pp_text_mining: {
      word_count: 1926,
      avg_word_length: 5.2,
      sentence_count: 127,
      avg_sentence_length: 15.2,
      readability_score: 39.8,
      unique_word_ratio: 0.27,
      capital_letter_frequency: 0.12,
      punctuation_density: 0.08,
      question_frequency: 0.01,
      paragraph_count: 30,
    },
    tos_word_frequency: [
      { word: 'service', count: 48 },
      { word: 'netflix', count: 42 },
      { word: 'content', count: 38 },
      { word: 'use', count: 32 },
      { word: 'account', count: 28 },
      { word: 'membership', count: 25 },
      { word: 'terms', count: 22 },
      { word: 'may', count: 20 },
      { word: 'agreement', count: 18 },
      { word: 'payment', count: 15 },
    ],
    pp_word_frequency: [
      { word: 'information', count: 54 },
      { word: 'netflix', count: 26 },
      { word: 'content', count: 24 },
      { word: 'data', count: 22 },
      { word: 'use', count: 17 },
      { word: 'viewing', count: 15 },
      { word: 'privacy', count: 14 },
      { word: 'collect', count: 12 },
      { word: 'share', count: 10 },
      { word: 'preferences', count: 8 },
    ],
  },
  {
    id: 6,
    name: 'Amazon',
    url: 'amazon.com',
    lastAnalyzed: '2023-10-18',
    views: 2100,
    docType: ['tos', 'pp'],
    logo: '/placeholder.svg?height=48&width=48',
    tos_link:
      'https://www.amazon.com/gp/help/customer/display.html?nodeId=508088',
    pp_link:
      'https://www.amazon.com/gp/help/customer/display.html?nodeId=468496',
    tos_summarization: {
      one_sentence:
        "Amazon's Terms of Service grant them extensive rights to modify the service and limit their liability.",
      hundred_words:
        "Amazon's Terms of Service establish a comprehensive legal framework that heavily favors the platform. The terms include limitations on liability, mandatory arbitration clauses, and extensive rights for Amazon to modify the service without notice. Users agree to comply with all applicable laws and regulations when using the service.",
    },
    pp_summarization: {
      one_sentence:
        'Amazon collects purchase history and browsing data to personalize recommendations.',
      hundred_words:
        "Amazon's Privacy Policy allows them to collect extensive data about your purchases, browsing history, and interactions with their services. This information is used for personalized recommendations, targeted advertising, and product development. They track your activities across their platforms and may share data with third-party partners and service providers.",
    },
    tos_text_mining: {
      word_count: 3850,
      avg_word_length: 5.1,
      sentence_count: 258,
      avg_sentence_length: 14.9,
      readability_score: 40.5,
      unique_word_ratio: 0.27,
      capital_letter_frequency: 0.11,
      punctuation_density: 0.08,
      question_frequency: 0.01,
      paragraph_count: 68,
    },
    pp_text_mining: {
      word_count: 2692,
      avg_word_length: 5.3,
      sentence_count: 178,
      avg_sentence_length: 15.1,
      readability_score: 39.1,
      unique_word_ratio: 0.25,
      capital_letter_frequency: 0.13,
      punctuation_density: 0.08,
      question_frequency: 0.03,
      paragraph_count: 44,
    },
    tos_word_frequency: [
      { word: 'amazon', count: 52 },
      { word: 'service', count: 45 },
      { word: 'content', count: 40 },
      { word: 'use', count: 35 },
      { word: 'product', count: 32 },
      { word: 'account', count: 28 },
      { word: 'may', count: 25 },
      { word: 'services', count: 22 },
      { word: 'terms', count: 20 },
      { word: 'purchase', count: 18 },
    ],
    pp_word_frequency: [
      { word: 'amazon', count: 37 },
      { word: 'information', count: 62 },
      { word: 'product', count: 20 },
      { word: 'purchase', count: 30 },
      { word: 'data', count: 53 },
      { word: 'use', count: 22 },
      { word: 'share', count: 18 },
      { word: 'collect', count: 25 },
      { word: 'privacy', count: 15 },
      { word: 'third-party', count: 12 },
    ],
  },
  {
    id: 7,
    name: 'Google',
    url: 'google.com',
    lastAnalyzed: '2023-10-15',
    views: 3200,
    docType: ['tos', 'pp'],
    logo: '/placeholder.svg?height=48&width=48',
    tos_link: 'https://policies.google.com/terms',
    pp_link: 'https://policies.google.com/privacy',
    tos_summarization: {
      one_sentence:
        "Google's Terms of Service grant them extensive rights to user content and allow them to modify or terminate services.",
      hundred_words:
        "Google's Terms of Service establish a comprehensive legal framework that heavily favors the platform. Users grant Google a worldwide license to use, host, store, reproduce, modify, create derivative works, communicate, publish, publicly perform, publicly display and distribute content. Google reserves the right to modify or terminate services at any time, for any reason, and without notice.",
    },
    pp_summarization: {
      one_sentence:
        'Google collects vast amounts of user data across all its services for advertising and personalization.',
      hundred_words:
        "Google's Privacy Policy grants them extensive rights to collect, analyze, and use your data across all their services. They track your search history, location, device information, and interactions with their platforms to build a comprehensive profile for targeted advertising. This data is used to personalize your experience, improve their services, and develop new products.",
    },
    tos_text_mining: {
      word_count: 4250,
      avg_word_length: 5.2,
      sentence_count: 285,
      avg_sentence_length: 14.9,
      readability_score: 39.5,
      unique_word_ratio: 0.26,
      capital_letter_frequency: 0.11,
      punctuation_density: 0.08,
      question_frequency: 0.02,
      paragraph_count: 75,
    },
    pp_text_mining: {
      word_count: 2878,
      avg_word_length: 5.4,
      sentence_count: 190,
      avg_sentence_length: 15.1,
      readability_score: 36.9,
      unique_word_ratio: 0.24,
      capital_letter_frequency: 0.13,
      punctuation_density: 0.08,
      question_frequency: 0.04,
      paragraph_count: 53,
    },
    tos_word_frequency: [
      { word: 'google', count: 58 },
      { word: 'service', count: 52 },
      { word: 'content', count: 45 },
      { word: 'use', count: 40 },
      { word: 'services', count: 35 },
      { word: 'account', count: 30 },
      { word: 'may', count: 25 },
      { word: 'terms', count: 22 },
      { word: 'rights', count: 18 },
      { word: 'software', count: 15 },
    ],
    pp_word_frequency: [
      { word: 'google', count: 36 },
      { word: 'information', count: 76 },
      { word: 'data', count: 68 },
      { word: 'use', count: 23 },
      { word: 'services', count: 22 },
      { word: 'privacy', count: 41 },
      { word: 'collect', count: 32 },
      { word: 'share', count: 28 },
      { word: 'personal', count: 25 },
      { word: 'advertising', count: 20 },
    ],
  },
  {
    id: 8,
    name: 'Microsoft',
    url: 'microsoft.com',
    lastAnalyzed: '2023-10-10',
    views: 1450,
    docType: ['tos', 'pp'],
    logo: '/placeholder.svg?height=48&width=48',
    tos_link: 'https://www.microsoft.com/en-us/servicesagreement/',
    pp_link: 'https://privacy.microsoft.com/en-us/privacystatement',
    tos_summarization: {
      one_sentence:
        "Microsoft's Terms of Service grant them extensive rights to user content and allow them to modify or terminate services.",
      hundred_words:
        "Microsoft's Terms of Service establish a comprehensive legal framework that heavily favors the platform. Users grant Microsoft a worldwide license to use, reproduce, distribute, and display content. Microsoft reserves the right to modify or terminate services at any time, for any reason, and with varying levels of notice depending on the service.",
    },
    pp_summarization: {
      one_sentence:
        'Microsoft collects user data across their ecosystem of products and services for personalization and improvement.',
      hundred_words:
        "Microsoft's Privacy Policy outlines how they collect and use data across their ecosystem of products and services, including Windows, Office, and cloud services. They track usage patterns, content interactions, and device information to improve services and deliver targeted advertising. This data is used to personalize your experience, enhance security, and develop new features.",
    },
    tos_text_mining: {
      word_count: 4150,
      avg_word_length: 5.1,
      sentence_count: 278,
      avg_sentence_length: 14.9,
      readability_score: 40.2,
      unique_word_ratio: 0.27,
      capital_letter_frequency: 0.1,
      punctuation_density: 0.08,
      question_frequency: 0.01,
      paragraph_count: 72,
    },
    pp_text_mining: {
      word_count: 2674,
      avg_word_length: 5.3,
      sentence_count: 177,
      avg_sentence_length: 15.1,
      readability_score: 38.6,
      unique_word_ratio: 0.25,
      capital_letter_frequency: 0.12,
      punctuation_density: 0.08,
      question_frequency: 0.03,
      paragraph_count: 46,
    },
    tos_word_frequency: [
      { word: 'microsoft', count: 56 },
      { word: 'service', count: 48 },
      { word: 'content', count: 42 },
      { word: 'use', count: 38 },
      { word: 'services', count: 33 },
      { word: 'account', count: 28 },
      { word: 'may', count: 24 },
      { word: 'terms', count: 20 },
      { word: 'software', count: 18 },
      { word: 'rights', count: 15 },
    ],
    pp_word_frequency: [
      { word: 'microsoft', count: 35 },
      { word: 'data', count: 72 },
      { word: 'information', count: 65 },
      { word: 'use', count: 21 },
      { word: 'services', count: 20 },
      { word: 'privacy', count: 38 },
      { word: 'collect', count: 30 },
      { word: 'personal', count: 25 },
      { word: 'product', count: 18 },
      { word: 'processing', count: 15 },
    ],
  },
  {
    id: 9,
    name: 'Apple',
    url: 'apple.com',
    lastAnalyzed: '2023-10-05',
    views: 1870,
    docType: ['tos', 'pp'],
    logo: '/placeholder.svg?height=48&width=48',
    tos_link: 'https://www.apple.com/legal/internet-services/itunes/',
    pp_link: 'https://www.apple.com/legal/privacy/en-ww/',
    tos_summarization: {
      one_sentence:
        "Apple's Terms of Service grant them rights to user content and include limitations on liability.",
      hundred_words:
        "Apple's Terms of Service establish a comprehensive legal framework that governs the use of their services. Users grant Apple a license to use, reproduce, and display content submitted to their services. The terms include limitations on liability and mandatory arbitration clauses that restrict users' ability to pursue legal action.",
    },
    pp_summarization: {
      one_sentence:
        'Apple emphasizes privacy but still collects user data for service improvement and advertising.',
      hundred_words:
        "Apple's Privacy Policy emphasizes their commitment to user privacy while still collecting data necessary for service improvement and targeted advertising. They collect device information, usage patterns, and interactions with their services, but claim to minimize data collection compared to competitors. Apple states that they use privacy-preserving technologies whenever possible and give users control over their data.",
    },
    tos_text_mining: {
      word_count: 3750,
      avg_word_length: 5.0,
      sentence_count: 252,
      avg_sentence_length: 14.9,
      readability_score: 41.0,
      unique_word_ratio: 0.28,
      capital_letter_frequency: 0.1,
      punctuation_density: 0.08,
      question_frequency: 0.01,
      paragraph_count: 65,
    },
    pp_text_mining: {
      word_count: 2378,
      avg_word_length: 5.2,
      sentence_count: 156,
      avg_sentence_length: 15.2,
      readability_score: 39.4,
      unique_word_ratio: 0.26,
      capital_letter_frequency: 0.12,
      punctuation_density: 0.08,
      question_frequency: 0.03,
      paragraph_count: 37,
    },
    tos_word_frequency: [
      { word: 'apple', count: 52 },
      { word: 'service', count: 45 },
      { word: 'content', count: 38 },
      { word: 'use', count: 35 },
      { word: 'account', count: 30 },
      { word: 'may', count: 25 },
      { word: 'services', count: 22 },
      { word: 'terms', count: 20 },
      { word: 'software', count: 18 },
      { word: 'device', count: 15 },
    ],
    pp_word_frequency: [
      { word: 'apple', count: 35 },
      { word: 'privacy', count: 76 },
      { word: 'information', count: 68 },
      { word: 'data', count: 57 },
      { word: 'use', count: 17 },
      { word: 'services', count: 25 },
      { word: 'collect', count: 30 },
      { word: 'personal', count: 28 },
      { word: 'device', count: 19 },
      { word: 'identifiers', count: 15 },
    ],
  },
  {
    id: 10,
    name: 'Reddit',
    url: 'reddit.com',
    lastAnalyzed: '2023-10-01',
    views: 1320,
    docType: ['tos', 'pp'],
    logo: '/placeholder.svg?height=48&width=48',
    tos_link: 'https://www.redditinc.com/policies/user-agreement',
    pp_link: 'https://www.reddit.com/policies/privacy-policy',
    tos_summarization: {
      one_sentence:
        "Reddit's Terms of Service grant them extensive rights to user content and include limitations on liability.",
      hundred_words:
        "Reddit's Terms of Service establish a comprehensive legal framework that heavily favors the platform. Users grant Reddit a worldwide license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute content. The terms include limitations on liability and mandatory arbitration clauses that restrict users' ability to pursue legal action.",
    },
    pp_summarization: {
      one_sentence:
        'Reddit collects user content, browsing behavior, and interaction data for personalization and advertising.',
      hundred_words:
        "Reddit's Privacy Policy outlines how they collect and use your content, browsing behavior, and interaction data. They track your subscriptions, posts, comments, and even how long you view specific content to personalize your experience and deliver targeted advertising. This data may be shared with third-party partners and service providers.",
    },
    tos_text_mining: {
      word_count: 3250,
      avg_word_length: 5.0,
      sentence_count: 218,
      avg_sentence_length: 14.9,
      readability_score: 41.5,
      unique_word_ratio: 0.28,
      capital_letter_frequency: 0.1,
      punctuation_density: 0.08,
      question_frequency: 0.01,
      paragraph_count: 56,
    },
    pp_text_mining: {
      word_count: 2178,
      avg_word_length: 5.2,
      sentence_count: 144,
      avg_sentence_length: 15.1,
      readability_score: 40.1,
      unique_word_ratio: 0.26,
      capital_letter_frequency: 0.12,
      punctuation_density: 0.08,
      question_frequency: 0.02,
      paragraph_count: 36,
    },
    tos_word_frequency: [
      { word: 'content', count: 48 },
      { word: 'reddit', count: 45 },
      { word: 'use', count: 38 },
      { word: 'service', count: 35 },
      { word: 'account', count: 28 },
      { word: 'may', count: 25 },
      { word: 'community', count: 22 },
      { word: 'post', count: 20 },
      { word: 'terms', count: 18 },
      { word: 'rights', count: 15 },
    ],
    pp_word_frequency: [
      { word: 'information', count: 68 },
      { word: 'reddit', count: 31 },
      { word: 'data', count: 51 },
      { word: 'use', count: 24 },
      { word: 'content', count: 34 },
      { word: 'collect', count: 28 },
      { word: 'service', count: 21 },
      { word: 'share', count: 18 },
      { word: 'privacy', count: 15 },
      { word: 'account', count: 18 },
    ],
  },
  {
    id: 11,
    name: 'YouTube',
    url: 'youtube.com',
    lastAnalyzed: '2023-09-28',
    views: 2450,
    docType: ['tos', 'pp'],
    logo: '/placeholder.svg?height=48&width=48',
    tos_link: 'https://www.youtube.com/t/terms',
    pp_link: 'https://policies.google.com/privacy',
    tos_summarization: {
      one_sentence:
        "YouTube's terms grant them broad rights to user content and allow them to modify or terminate services.",
      hundred_words:
        "YouTube's Terms of Service grant them broad rights to user-uploaded content, including the ability to monetize, modify, and distribute it. Users grant YouTube a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform content. YouTube reserves the right to modify or terminate services at any time, for any reason, and without notice.",
    },
    pp_summarization: {
      one_sentence:
        "YouTube shares Google's Privacy Policy, allowing extensive data collection for personalization and advertising.",
      hundred_words:
        "YouTube's Privacy Policy (shared with Google) allows extensive data collection, including viewing history, search queries, and interaction patterns, which are used for content recommendations and targeted advertising. They track your activities across their platforms and may share data with third-party partners and service providers.",
    },
    tos_text_mining: {
      word_count: 3650,
      avg_word_length: 5.1,
      sentence_count: 245,
      avg_sentence_length: 14.9,
      readability_score: 40.2,
      unique_word_ratio: 0.27,
      capital_letter_frequency: 0.11,
      punctuation_density: 0.08,
      question_frequency: 0.01,
      paragraph_count: 62,
    },
    pp_text_mining: {
      word_count: 2278,
      avg_word_length: 5.3,
      sentence_count: 150,
      avg_sentence_length: 15.2,
      readability_score: 39.0,
      unique_word_ratio: 0.25,
      capital_letter_frequency: 0.11,
      punctuation_density: 0.08,
      question_frequency: 0.03,
      paragraph_count: 36,
    },
    tos_word_frequency: [
      { word: 'content', count: 56 },
      { word: 'youtube', count: 52 },
      { word: 'service', count: 45 },
      { word: 'use', count: 38 },
      { word: 'video', count: 35 },
      { word: 'account', count: 28 },
      { word: 'may', count: 25 },
      { word: 'rights', count: 22 },
      { word: 'terms', count: 20 },
      { word: 'google', count: 18 },
    ],
    pp_word_frequency: [
      { word: 'information', count: 61 },
      { word: 'google', count: 41 },
      { word: 'youtube', count: 30 },
      { word: 'data', count: 28 },
      { word: 'use', count: 29 },
      { word: 'video', count: 21 },
      { word: 'collect', count: 25 },
      { word: 'share', count: 18 },
      { word: 'privacy', count: 15 },
      { word: 'advertising', count: 12 },
    ],
  },
  {
    id: 12,
    name: 'LinkedIn',
    url: 'linkedin.com',
    lastAnalyzed: '2023-09-25',
    views: 980,
    docType: ['tos', 'pp'],
    logo: '/placeholder.svg?height=48&width=48',
    tos_link: 'https://www.linkedin.com/legal/user-agreement',
    pp_link: 'https://www.linkedin.com/legal/privacy-policy',
    tos_summarization: {
      one_sentence:
        "LinkedIn's Terms of Service grant them extensive rights to user content and include limitations on liability.",
      hundred_words:
        "LinkedIn's Terms of Service establish a comprehensive legal framework that heavily favors the platform. Users grant LinkedIn a worldwide license to use, copy, modify, distribute, publish, and process information and content. The terms include limitations on liability and mandatory arbitration clauses that restrict users' ability to pursue legal action.",
    },
    pp_summarization: {
      one_sentence:
        'LinkedIn collects professional and personal data to build user profiles for networking and recruitment services.',
      hundred_words:
        "LinkedIn's Privacy Policy outlines how they collect and use your professional and personal data to build comprehensive user profiles. They track your work history, skills, connections, and interactions with the platform to provide networking and recruitment services. This data is also used for targeted advertising and may be shared with third-party partners.",
    },
    tos_text_mining: {
      word_count: 3450,
      avg_word_length: 5.1,
      sentence_count: 232,
      avg_sentence_length: 14.9,
      readability_score: 40.5,
      unique_word_ratio: 0.27,
      capital_letter_frequency: 0.11,
      punctuation_density: 0.08,
      question_frequency: 0.01,
      paragraph_count: 58,
    },
    pp_text_mining: {
      word_count: 2278,
      avg_word_length: 5.3,
      sentence_count: 150,
      avg_sentence_length: 15.2,
      readability_score: 39.1,
      unique_word_ratio: 0.25,
      capital_letter_frequency: 0.11,
      punctuation_density: 0.08,
      question_frequency: 0.03,
      paragraph_count: 38,
    },
    tos_word_frequency: [
      { word: 'linkedin', count: 52 },
      { word: 'professional', count: 45 },
      { word: 'content', count: 38 },
      { word: 'service', count: 35 },
      { word: 'use', count: 32 },
      { word: 'account', count: 28 },
      { word: 'may', count: 25 },
      { word: 'profile', count: 22 },
      { word: 'terms', count: 20 },
      { word: 'rights', count: 18 },
    ],
    pp_word_frequency: [
      { word: 'linkedin', count: 34 },
      { word: 'information', count: 72 },
      { word: 'professional', count: 33 },
      { word: 'data', count: 44 },
      { word: 'profile', count: 27 },
      { word: 'use', count: 22 },
      { word: 'collect', count: 25 },
      { word: 'share', count: 18 },
      { word: 'connection', count: 15 },
      { word: 'service', count: 24 },
    ],
  },
  {
    id: 13,
    name: 'TikTok',
    url: 'tiktok.com',
    lastAnalyzed: '2023-09-20',
    views: 2800,
    docType: ['tos', 'pp'],
    logo: '/placeholder.svg?height=48&width=48',
    tos_link: 'https://www.tiktok.com/legal/terms-of-service',
    pp_link: 'https://www.tiktok.com/legal/privacy-policy',
    tos_summarization: {
      one_sentence:
        "TikTok's Terms of Service grant them extensive rights to user content and include limitations on liability.",
      hundred_words:
        "TikTok's Terms of Service establish a comprehensive legal framework that heavily favors the platform. Users grant TikTok an irrevocable, non-exclusive, royalty-free, transferable, sublicensable, worldwide license to use, modify, reproduce, and distribute content. The terms include limitations on liability and mandatory arbitration clauses that restrict users' ability to pursue legal action.",
    },
    pp_summarization: {
      one_sentence:
        'TikTok collects extensive user data including biometric information and precise location for personalization and advertising.',
      hundred_words:
        "TikTok's Privacy Policy allows them to collect extensive user data, including content interactions, viewing patterns, device information, and in some regions, biometric information derived from your videos. They track your precise location, app usage, and even clipboard content to personalize your experience and deliver targeted advertising. This data may be shared with third-party partners and service providers.",
    },
    tos_text_mining: {
      word_count: 3750,
      avg_word_length: 5.1,
      sentence_count: 252,
      avg_sentence_length: 14.9,
      readability_score: 40.0,
      unique_word_ratio: 0.27,
      capital_letter_frequency: 0.11,
      punctuation_density: 0.08,
      question_frequency: 0.01,
      paragraph_count: 62,
    },
    pp_text_mining: {
      word_count: 2378,
      avg_word_length: 5.3,
      sentence_count: 156,
      avg_sentence_length: 15.2,
      readability_score: 38.8,
      unique_word_ratio: 0.25,
      capital_letter_frequency: 0.11,
      punctuation_density: 0.08,
      question_frequency: 0.03,
      paragraph_count: 40,
    },
    tos_word_frequency: [
      { word: 'tiktok', count: 54 },
      { word: 'content', count: 48 },
      { word: 'service', count: 42 },
      { word: 'use', count: 38 },
      { word: 'platform', count: 32 },
      { word: 'account', count: 28 },
      { word: 'may', count: 25 },
      { word: 'video', count: 22 },
      { word: 'terms', count: 20 },
      { word: 'rights', count: 18 },
    ],
    pp_word_frequency: [
      { word: 'information', count: 75 },
      { word: 'tiktok', count: 34 },
      { word: 'data', count: 69 },
      { word: 'use', count: 25 },
      { word: 'content', count: 34 },
      { word: 'collect', count: 30 },
      { word: 'service', count: 25 },
      { word: 'share', count: 20 },
      { word: 'device', count: 18 },
      { word: 'platform', count: 20 },
    ],
  },
  {
    id: 14,
    name: 'Uber',
    url: 'uber.com',
    lastAnalyzed: '2023-09-15',
    views: 920,
    docType: ['tos', 'pp'],
    logo: '/placeholder.svg?height=48&width=48',
    tos_link:
      'https://www.uber.com/legal/en/document/?name=general-terms-of-use',
    pp_link: 'https://www.uber.com/global/en/privacy/notice/',
    tos_summarization: {
      one_sentence:
        "Uber's Terms of Service include limitations on liability and mandatory arbitration clauses.",
      hundred_words:
        "Uber's Terms of Service establish a comprehensive legal framework that heavily favors the platform. The terms include limitations on liability and mandatory arbitration clauses that restrict users' ability to pursue legal action. Uber reserves the right to modify or terminate services at any time, for any reason, and with varying levels of notice.",
    },
    pp_summarization: {
      one_sentence:
        'Uber collects location data, device information, and usage patterns to provide transportation services and improve their platform.',
      hundred_words:
        "Uber's Privacy Policy outlines how they collect and use your location data, device information, and usage patterns to provide transportation services and improve their platform. They track your precise location, routes taken, and even device battery level to optimize their service and provide personalized recommendations. This data may be shared with third-party partners and service providers.",
    },
    tos_text_mining: {
      word_count: 3250,
      avg_word_length: 5.0,
      sentence_count: 218,
      avg_sentence_length: 14.9,
      readability_score: 41.0,
      unique_word_ratio: 0.28,
      capital_letter_frequency: 0.1,
      punctuation_density: 0.08,
      question_frequency: 0.01,
      paragraph_count: 56,
    },
    pp_text_mining: {
      word_count: 2178,
      avg_word_length: 5.2,
      sentence_count: 144,
      avg_sentence_length: 15.1,
      readability_score: 39.4,
      unique_word_ratio: 0.26,
      capital_letter_frequency: 0.12,
      punctuation_density: 0.08,
      question_frequency: 0.03,
      paragraph_count: 36,
    },
    tos_word_frequency: [
      { word: 'uber', count: 52 },
      { word: 'service', count: 45 },
      { word: 'use', count: 38 },
      { word: 'driver', count: 32 },
      { word: 'ride', count: 28 },
      { word: 'may', count: 25 },
      { word: 'account', count: 22 },
      { word: 'terms', count: 20 },
      { word: 'payment', count: 18 },
      { word: 'rights', count: 15 },
    ],
    pp_word_frequency: [
      { word: 'information', count: 69 },
      { word: 'uber', count: 32 },
      { word: 'location', count: 63 },
      { word: 'data', count: 52 },
      { word: 'use', count: 25 },
      { word: 'collect', count: 28 },
      { word: 'service', count: 31 },
      { word: 'share', count: 18 },
      { word: 'driver', count: 15 },
      { word: 'ride', count: 14 },
    ],
  },
  {
    id: 15,
    name: 'Airbnb',
    url: 'airbnb.com',
    lastAnalyzed: '2023-09-10',
    views: 1050,
    docType: ['tos', 'pp'],
    logo: '/placeholder.svg?height=48&width=48',
    tos_link: 'https://www.airbnb.com/terms',
    pp_link: 'https://www.airbnb.com/terms/privacy_policy',
    tos_summarization: {
      one_sentence:
        "Airbnb's Terms of Service include limitations on liability and mandatory arbitration clauses.",
      hundred_words:
        "Airbnb's Terms of Service establish a comprehensive legal framework that heavily favors the platform. The terms include limitations on liability and mandatory arbitration clauses that restrict users' ability to pursue legal action. Airbnb reserves the right to modify or terminate services at any time, for any reason, and with varying levels of notice.",
    },
    pp_summarization: {
      one_sentence:
        'Airbnb collects personal and financial information to facilitate bookings and verify user identities.',
      hundred_words:
        "Airbnb's Privacy Policy outlines how they collect and use your personal and financial information to facilitate bookings and verify user identities. They collect government IDs, payment details, and even social media profiles to build trust on their platform. This data is used to personalize your experience and may be shared with hosts, guests, and third-party partners.",
    },
    tos_text_mining: {
      word_count: 3350,
      avg_word_length: 5.0,
      sentence_count: 225,
      avg_sentence_length: 14.9,
      readability_score: 41.2,
      unique_word_ratio: 0.28,
      capital_letter_frequency: 0.1,
      punctuation_density: 0.08,
      question_frequency: 0.01,
      paragraph_count: 58,
    },
    pp_text_mining: {
      word_count: 2278,
      avg_word_length: 5.2,
      sentence_count: 150,
      avg_sentence_length: 15.2,
      readability_score: 39.6,
      unique_word_ratio: 0.26,
      capital_letter_frequency: 0.12,
      punctuation_density: 0.08,
      question_frequency: 0.03,
      paragraph_count: 36,
    },
    tos_word_frequency: [
      { word: 'airbnb', count: 52 },
      { word: 'host', count: 45 },
      { word: 'service', count: 42 },
      { word: 'booking', count: 38 },
      { word: 'guest', count: 35 },
      { word: 'may', count: 28 },
      { word: 'account', count: 25 },
      { word: 'terms', count: 22 },
      { word: 'payment', count: 20 },
      { word: 'rights', count: 18 },
    ],
    pp_word_frequency: [
      { word: 'information', count: 66 },
      { word: 'airbnb', count: 33 },
      { word: 'host', count: 33 },
      { word: 'guest', count: 15 },
      { word: 'booking', count: 23 },
      { word: 'data', count: 30 },
      { word: 'use', count: 22 },
      { word: 'collect', count: 25 },
      { word: 'share', count: 18 },
      { word: 'payment', count: 16 },
    ],
  },
]

// Helper function to get a result by ID
export function getResultById(id: string | number) {
  const numericId = typeof id === 'string' ? Number.parseInt(id, 10) : id
  return allResults.find((result) => result.id === numericId)
}

// Define the result type
export interface SearchResult {
  id: number
  name: string
  url: string
  lastAnalyzed: string
  views: number
  docType: string[]
  logo: string
  tos_link?: string
  pp_link?: string
  tos_summarization: {
    one_sentence: string
    hundred_words: string
  }
  pp_summarization: {
    one_sentence: string
    hundred_words: string
  }
  tos_text_mining: {
    word_count: number
    avg_word_length: number
    sentence_count: number
    avg_sentence_length: number
    readability_score: number
    unique_word_ratio: number
    capital_letter_frequency: number
    punctuation_density: number
    question_frequency: number
    paragraph_count: number
  }
  pp_text_mining: {
    word_count: number
    avg_word_length: number
    sentence_count: number
    avg_sentence_length: number
    readability_score: number
    unique_word_ratio: number
    capital_letter_frequency: number
    punctuation_density: number
    question_frequency: number
    paragraph_count: number
  }
  tos_word_frequency: Array<{
    word: string
    count: number
  }>
  pp_word_frequency: Array<{
    word: string
    count: number
  }>
}
