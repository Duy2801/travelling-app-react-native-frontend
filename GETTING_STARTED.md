# Hướng dẫn sử dụng ứng dụng Đăng ký Tour Du lịch

## 🚀 Bắt đầu

### 1. Khởi động Backend (Quan trọng!)

Trước tiên, bạn cần khởi động backend server:

```bash
cd d:\DuAnDiDong\traveling-app-react-native-backend
npm install
npm start
```

Backend sẽ chạy tại: `http://localhost:3000`

### 2. Cấu hình API URL

Nếu bạn test trên thiết bị thật (không phải emulator), bạn cần thay đổi URL API:

**Mở file:** `src/services/api.ts`

```typescript
// Thay đổi localhost thành IP của máy tính bạn
const API_BASE_URL = 'http://192.168.1.XXX:3000/v1';
```

**Cách tìm IP của máy tính:**
- Windows: Mở Command Prompt, gõ `ipconfig`, tìm IPv4 Address
- Mac: System Preferences > Network
- Ví dụ: `http://192.168.1.100:3000/v1`

### 3. Khởi động ứng dụng

```bash
cd d:\DuAnDiDong\traval-app-frontend
npm start
```

Sau đó:
- Quét QR code bằng Expo Go app (Android/iOS)
- Hoặc nhấn `a` để chạy Android emulator
- Hoặc nhấn `i` để chạy iOS simulator
- Hoặc nhấn `w` để chạy trên web

## 📱 Tính năng đã hoàn thành

### Màn hình Đăng ký
✅ Nhập họ tên, email, mật khẩu
✅ Xác nhận mật khẩu
✅ Validation đầy đủ:
   - Email phải đúng định dạng
   - Mật khẩu ít nhất 8 ký tự, có chữ và số
   - Mật khẩu xác nhận phải khớp
✅ Kết nối với backend API
✅ Lưu token vào AsyncStorage
✅ Chuyển sang màn hình đăng nhập sau khi đăng ký thành công

### Màn hình Đăng nhập
✅ Nhập email và mật khẩu
✅ Validation
✅ Kết nối với backend API
✅ Lưu token và thông tin user

## 🎯 Cách test

### Test đăng ký:
1. Mở ứng dụng (sẽ hiện màn hình Đăng nhập)
2. Nhấn "Đăng ký ngay"
3. Điền thông tin:
   - Họ tên: "Nguyễn Văn A"
   - Email: "test@example.com"
   - Mật khẩu: "password123"
   - Xác nhận mật khẩu: "password123"
4. Nhấn "Đăng Ký"
5. Nếu thành công, sẽ có thông báo và chuyển sang màn hình đăng nhập

### Test đăng nhập:
1. Nhập email và mật khẩu vừa đăng ký
2. Nhấn "Đăng Nhập"
3. Nếu thành công, sẽ có thông báo chào mừng

## 🔧 API Endpoints được sử dụng

### POST /auth/register
**Body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "...",
    "name": "Nguyễn Văn A",
    "email": "test@example.com",
    "role": "user",
    "isEmailVerified": false
  },
  "tokens": {
    "access": {
      "token": "...",
      "expires": "..."
    },
    "refresh": {
      "token": "...",
      "expires": "..."
    }
  }
}
```

### POST /auth/login
**Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:** Giống như register

## 📂 Cấu trúc code đã tạo

```
traval-app-frontend/
├── src/
│   ├── screens/
│   │   ├── RegisterScreen.tsx    # Màn hình đăng ký
│   │   └── LoginScreen.tsx       # Màn hình đăng nhập
│   ├── services/
│   │   ├── api.ts               # Axios instance với interceptors
│   │   └── authService.ts       # Các functions gọi API authentication
│   └── types/
│       └── index.ts             # TypeScript types & interfaces
├── App.tsx                       # Navigation setup
├── package.json
└── tsconfig.json
```

## 🎨 Giao diện

- **Màu chính:** #007AFF (Blue)
- **Font size:** 14-32px
- **Border radius:** 12px
- **Padding:** 16-24px
- **Responsive:** Hỗ trợ đầy đủ bàn phím với KeyboardAvoidingView
- **Loading states:** ActivityIndicator khi đang xử lý
- **Smooth animations:** Navigation với slide_from_right

## ⚠️ Lưu ý quan trọng

1. **Backend phải chạy trước:** Đảm bảo backend đang chạy tại port 3000
2. **MongoDB phải chạy:** Backend cần MongoDB để lưu dữ liệu
3. **Firewall:** Nếu test trên thiết bị thật, cho phép port 3000 qua firewall
4. **Email unique:** Mỗi email chỉ đăng ký được 1 lần
5. **Password validation:** Backend yêu cầu password có ít nhất 8 ký tự, có chữ và số

## 🐛 Xử lý lỗi thường gặp

### "Network Error"
- ✅ Kiểm tra backend đang chạy
- ✅ Kiểm tra IP address trong api.ts
- ✅ Kiểm tra firewall

### "Email already exists"
- ✅ Email đã được đăng ký, dùng email khác hoặc đăng nhập

### "Invalid email or password"
- ✅ Kiểm tra lại email và password
- ✅ Email phải đúng định dạng
- ✅ Password đủ điều kiện (8 ký tự, có chữ và số)

### "Cannot connect to server"
- ✅ Backend chưa chạy
- ✅ MongoDB chưa chạy
- ✅ IP address không đúng

## 📝 Tiếp theo cần làm

Các tính năng có thể mở rộng:
- [ ] Màn hình Home với danh sách tours
- [ ] Chi tiết tour
- [ ] Booking tour
- [ ] Profile user
- [ ] Lịch sử đặt tour
- [ ] Reviews và ratings
- [ ] Forgot password
- [ ] Email verification
- [ ] Context/Redux cho state management
- [ ] Push notifications
- [ ] Payment integration

## 🎓 Học thêm

- [React Native Docs](https://reactnative.dev)
- [Expo Docs](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 💡 Tips

1. **Sử dụng React DevTools** để debug
2. **Console.log** để kiểm tra dữ liệu
3. **Expo Go** để test nhanh trên thiết bị thật
4. **Hot reload** sẽ tự động cập nhật khi bạn lưu file
5. **Clear cache** nếu gặp vấn đề: `expo start -c`

---

Chúc bạn code vui vẻ! 🚀
