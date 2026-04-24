Pod::Spec.new do |s|
  s.name         = 'GuardianGate'
  s.version      = '0.1.0'
  s.summary      = 'A React Native bridge for iOS Screen Time API'
  s.description  = <<-DESC
                   Native module for iOS Screen Time API to enable content filtering.
                   DESC
  s.homepage     = 'https://github.com/your-repo/guardian-gate'
  s.license      = { :type => 'MIT', :file => 'LICENSE' }
  s.author       = { 'Your Name' => 'your.email@example.com' }
  s.source       = { :git => 'https://github.com/your-repo/guardian-gate.git', :tag => s.version.to_s }
  s.ios.deployment_target = '12.0'
  s.source_files = 'ScreenTimeModule.{h,m,swift}'
  s.dependency 'React'
end
