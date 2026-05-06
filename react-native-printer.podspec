require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'react-native-printer'
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']
  s.homepage     = 'https://github.com/kaseru/react-native-printer'
  s.author       = { 'Kaseru' => 'dev@kaseru.vn' }
  s.platform     = :ios, '11.0'
  s.source       = { :git => 'https://github.com/kaseru/react-native-printer', :tag => "v#{s.version}" }
  s.source_files = 'ios/**/*.{h,m,swift}'
  s.exclude_files = [
    'ios/**/*.xcodeproj/**',
    'ios/**/*.xcworkspace/**'
  ]
  s.requires_arc = true
  s.dependency 'React'
end
