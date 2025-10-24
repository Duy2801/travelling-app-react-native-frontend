# Expo Router Configuration

Ứng dụng sử dụng **Expo Router** cho navigation - một giải pháp routing file-based hiện đại.

## Cấu trúc thư mục app/

```
app/
├── _layout.tsx       # Root layout - định nghĩa Stack Navigator
├── index.tsx         # Trang chủ - redirect to login
├── login.tsx         # Màn hình đăng nhập (/login)
└── register.tsx      # Màn hình đăng ký (/register)
```

## Routes

- `/` → Redirect to `/login`
- `/login` → Màn hình đăng nhập
- `/register` → Màn hình đăng ký

## Navigation

### Sử dụng useRouter hook:

```tsx
import { useRouter } from 'expo-router';

function MyComponent() {
  const router = useRouter();
  
  // Navigate to a route
  router.push('/login');
  
  // Navigate and replace
  router.replace('/home');
  
  // Go back
  router.back();
}
```

### Sử dụng Link component:

```tsx
import { Link } from 'expo-router';

<Link href="/register">Đăng ký</Link>
```

## So sánh với React Navigation

| React Navigation | Expo Router |
|------------------|-------------|
| `navigation.navigate('Login')` | `router.push('/login')` |
| `navigation.replace('Home')` | `router.replace('/home')` |
| `navigation.goBack()` | `router.back()` |

## Ưu điểm Expo Router

1. ✅ **File-based routing** - Routes tự động từ cấu trúc file
2. ✅ **TypeScript support** - Auto-complete cho routes
3. ✅ **Deep linking** - Built-in support
4. ✅ **SEO friendly** - Tốt cho web
5. ✅ **Code splitting** - Lazy loading tự động
6. ✅ **Simpler** - Ít boilerplate code hơn

## Migration từ React Navigation

Đã thay đổi:
- ❌ Xóa `@react-navigation/native`
- ❌ Xóa `@react-navigation/native-stack`
- ❌ Xóa `App.tsx` (thay bằng `app/_layout.tsx`)
- ✅ Thêm `expo-router`
- ✅ Tạo thư mục `app/` với routing file-based
- ✅ Cập nhật `app.json` với plugin `expo-router`
