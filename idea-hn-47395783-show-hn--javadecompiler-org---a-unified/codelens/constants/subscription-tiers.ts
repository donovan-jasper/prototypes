export const subscriptionTiers = {
  free: {
    decompilationsPerMonth: 3,
    fileSizeLimit: 50 * 1024 * 1024, // 50MB
    features: ['java_decompilation', 'basic_viewing'],
  },
  premium: {
    decompilationsPerMonth: 'unlimited',
    fileSizeLimit: 'unlimited',
    features: [
      'java_decompilation',
      'kotlin_decompilation',
      'js_decompilation',
      'security_scan',
      'comparison_mode',
      'export_functionality',
    ],
  },
  enterprise: {
    decompilationsPerMonth: 'unlimited',
    fileSizeLimit: 'unlimited',
    features: [
      'java_decompilation',
      'kotlin_decompilation',
      'js_decompilation',
      'swift_decompilation',
      'security_scan',
      'comparison_mode',
      'export_functionality',
      'team_collaboration',
      'custom_rules',
      'api_access',
    ],
  },
};
