# Sửa lỗi "getDevServer is not a function" - ĐÃ HOÀN TẤT! ✅

## 🎉 Đã sửa thành công!

Lỗi **"getDevServer is not a function"** đã được khắc phục bằng cách cập nhật Expo Router và dependencies.

## 🔧 Các bước đã thực hiện:

### 1. Cập nhật Expo Router lên v6
```bash
npm install expo-router@~6.0.13
```
- Expo SDK 54 yêu cầu Expo Router v6, không tương thích với v4

### 2. Cập nhật dependencies tương thích
```bash
npm install expo-constants@~18.0.10 expo-linking@~8.0.8
```

### 3. Cài đặt React Native Reanimated & Gesture Handler
```bash
npm install react-native-reanimated@~3.16.5 react-native-gesture-handler@~2.22.0 --legacy-peer-deps
```
- Cần thiết cho Expo Router v6
- Sử dụng `--legacy-peer-deps` để bỏ qua xung đột React 19.1 vs 19.2

### 4. Cài đặt Babel Preset
```bash
npm install babel-preset-expo --save-dev
```

### 5. Tạo babel.config.js
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
```

### 6. Cập nhật app/_layout.tsx
```tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
```

## 📦 Packages đã cập nhật:

| Package | Phiên bản cũ | Phiên bản mới |
|---------|--------------|----------------|
| expo-router | ~4.0.17 | ~6.0.13 |
| expo-constants | 17.0.8 | 18.0.10 |
| expo-linking | 7.0.5 | 8.0.8 |
| react-native-reanimated | - | 3.16.7 |
| react-native-gesture-handler | - | 2.22.1 |
| babel-preset-expo | - | ~11.1.0 (dev) |

## ⚠️ Cảnh báo còn lại (có thể bỏ qua):

Expo khuyến nghị cập nhật lên phiên bản mới nhất nhưng app vẫn chạy được:
- `react-native-gesture-handler@2.22.1` → recommended: ~2.28.0
- `react-native-reanimated@3.16.7` → recommended: ~4.1.1

**Lý do chưa cập nhật:** Các phiên bản này có thể gây xung đột với React 19.1

## 🚀 Cách chạy:

```bash
cd d:\DuAnDiDong\traval-app-frontend
npx expo start --clear
```

Hoặc sử dụng file PowerShell script:
```powershell
.\start.ps1
```

## ✅ Kết quả:

- ✅ Server chạy thành công tại `exp://172.20.10.3:8081`
- ✅ Không còn lỗi "getDevServer is not a function"
- ✅ Expo Router v6 hoạt động tốt
- ✅ Có thể quét QR code để test trên Expo Go

## 📱 Test ứng dụng:

1. Quét QR code bằng Expo Go app
2. Ứng dụng sẽ load và redirect to `/login`
3. Có thể navigate giữa Login và Register

## 🔍 Nguyên nhân lỗi ban đầu:

**Lỗi:** `TypeError: getDevServer is not a function (it is Object)`

**Nguyên nhân:**
- Expo Router v4.0.17 không tương thích với Expo SDK 54
- Expo SDK 54 yêu cầu Expo Router v6.x
- Missing babel-preset-expo
- Missing react-native-reanimated plugin

**Giải pháp:**
- Cập nhật lên Expo Router v6.0.13
- Cài đặt đầy đủ dependencies
- Cấu hình Babel đúng

## 📝 Lưu ý tiếp theo:

Nếu muốn cập nhật lên phiên bản recommended:
```bash
npm install react-native-gesture-handler@~2.28.0 react-native-reanimated@~4.1.1 --legacy-peer-deps
```

**Rủi ro:** Có thể gây xung đột với React 19.1, cần test kỹ.

---

✅ **Lỗi đã được sửa hoàn toàn! Ứng dụng đang chạy bình thường!**
