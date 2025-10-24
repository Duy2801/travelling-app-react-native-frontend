# Travel App Frontend - React Native

Ứng dụng di động đặt tour du lịch được xây dựng bằng **React Native**, **TypeScript** và **Expo Router**.

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Cấu hình API URL:
Mở file `src/services/api.ts` và thay đổi `API_BASE_URL` để kết nối với backend của bạn:
```typescript
const API_BASE_URL = 'http://YOUR_IP_ADDRESS:3000/v1';
```

**Lưu ý:** Không sử dụng `localhost` khi chạy trên thiết bị thật. Sử dụng địa chỉ IP của máy tính (ví dụ: `http://192.168.1.100:3000/v1`)

## Chạy ứng dụng

```bash
# Khởi động Expo
npm start

# Chạy trên Android
npm run android

# Chạy trên iOS
npm run ios

# Chạy trên web
npm run web
```

## Công nghệ sử dụng

- ✅ **React Native** - Framework mobile cross-platform
- ✅ **TypeScript** - Type safety
- ✅ **Expo** - Development platform
- ✅ **Expo Router** - File-based routing (thay React Navigation)
- ✅ **Axios** - HTTP client
- ✅ **AsyncStorage** - Local storage

## Cấu trúc thư mục

```
traval-app-frontend/
├── app/                    # Expo Router - File-based routing
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Home route (redirect to login)
│   ├── login.tsx          # Login screen
│   └── register.tsx       # Register screen
├── src/
│   ├── screens/           # Old screens (có thể xóa)
│   ├── services/          # API services
│   │   ├── api.ts
│   │   └── authService.ts
│   └── types/             # TypeScript types
│       └── index.ts
├── assets/                # Images, fonts, etc.
├── app.json              # Expo configuration
├── package.json
└── tsconfig.json
```

## Tính năng đã triển khai

### ✅ Navigation với Expo Router
- File-based routing
- TypeScript support
- Deep linking ready
- SEO friendly

### ✅ Đăng ký (Register)
- Form đăng ký với validation đầy đủ
- Kiểm tra email hợp lệ
- Kiểm tra mật khẩu (ít nhất 8 ký tự, có chữ và số)
- Xác nhận mật khẩu
- Tích hợp API backend để đăng ký
- Lưu tokens vào AsyncStorage

### ✅ Đăng nhập (Login)
- Form đăng nhập
- Validation
- Tích hợp API backend
- Lưu trữ authentication tokens

### ✅ Auth Service
- Axios instance với interceptors
- Quản lý tokens
- AsyncStorage để lưu trữ dữ liệu
- Xử lý lỗi API

## Expo Router

Ứng dụng sử dụng **Expo Router** thay vì React Navigation truyền thống.

### Routes:
- `/` → Redirect to `/login`
- `/login` → Màn hình đăng nhập
- `/register` → Màn hình đăng ký

### Navigation:
```tsx
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/login');      // Navigate
router.replace('/home');    // Replace
router.back();              // Go back
```

Xem thêm: [EXPO_ROUTER.md](./EXPO_ROUTER.md)

## API Backend

Ứng dụng kết nối với backend tại: `http://localhost:3000/v1`

### Endpoints sử dụng:
- `POST /auth/register` - Đăng ký tài khoản
- `POST /auth/login` - Đăng nhập
- `POST /auth/logout` - Đăng xuất

## Giao diện

Ứng dụng sử dụng thiết kế hiện đại với:
- 🎨 Màu sắc: Blue (#007AFF) làm màu chính
- 📱 Responsive layout
- ⌨️ KeyboardAvoidingView để xử lý bàn phím
- 🔄 Loading states
- ✨ Smooth animations

## Yêu cầu hệ thống

- Node.js >= 22.13.1
- npm >= 10.0.0
- Expo CLI
- Android Studio (cho Android) hoặc Xcode (cho iOS)
- Backend API running

## Troubleshooting

### Lỗi kết nối API
- Kiểm tra backend đang chạy
- Kiểm tra IP address trong `api.ts`
- Kiểm tra firewall

### Lỗi cài đặt dependencies
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

### Lỗi Metro bundler
```bash
# Clear cache
npx expo start -c
```

### Lỗi Expo Router
```bash
# Đảm bảo không còn file App.tsx hoặc index.ts ở root
# Chỉ nên có thư mục app/ với các route files
```
