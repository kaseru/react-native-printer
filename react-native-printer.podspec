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
    'ios/**/*.xcworkspace/**',
    'ios/ZXingObjC-3.2.2/*.md',
    'ios/ZXingObjC-3.2.2/AUTHORS',
    'ios/ZXingObjC-3.2.2/COPYING',
    'ios/ZXingObjC-3.2.2/NOTICE',
    'ios/ZXingObjC-3.2.2/*-Info.plist',
    'ios/ZXingObjC-3.2.2/*-Prefix.pch'
  ]
  s.requires_arc = true
  s.dependency 'React'
  s.xcconfig = {
    'HEADER_SEARCH_PATHS' => '"${PODS_TARGET_SRCROOT}/ios/ZXingObjC-3.2.2/**"'
  }
end
