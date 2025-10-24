# Node Version Configuration

## Phiên bản Node.js được sử dụng
- **Node.js:** v22.13.1
- **npm:** v11.1.0

## Cách sử dụng

### Nếu dùng NVM (Node Version Manager)

```bash
# Cài đặt và sử dụng version được chỉ định
nvm install 22.13.1
nvm use 22.13.1

# Hoặc tự động sử dụng từ file .nvmrc
nvm use
```

### Nếu dùng nvm-windows

```bash
# Cài đặt
nvm install 22.13.1

# Sử dụng
nvm use 22.13.1
```

## Kiểm tra version

```bash
node -v    # Phải hiện v22.13.1
npm -v     # Phải hiện 11.1.0 trở lên
```

## Tính năng mới của Node.js v22

Node.js v22.13.1 hỗ trợ:
- ✅ ES Modules (ESM) native
- ✅ Top-level await
- ✅ Watch mode (`node --watch`)
- ✅ Built-in test runner
- ✅ Improved performance
- ✅ Better TypeScript support
- ✅ Fetch API native

## Cài đặt dependencies

```bash
# Xóa node_modules và package-lock.json (nếu có vấn đề)
rm -rf node_modules package-lock.json

# Cài đặt lại
npm install
```

## Lưu ý

Đảm bảo toàn bộ team sử dụng cùng version Node.js để tránh các vấn đề không tương thích.
