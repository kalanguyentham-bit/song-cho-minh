# Ghi chú chuyển hướng (giải thích cho vercel.json)

vercel.json không cho viết chú thích, nên mỗi dòng được giải thích ở đây. Mỗi lần thêm hoặc sửa chuyển hướng trong vercel.json, cập nhật file này.
File này nằm trong .vercelignore nên không bị đưa lên web.

| Từ | Sang | Loại | Giải thích |
|---|---|---|---|
| `www.thantamcanh.com/...` | `https://thantamcanh.com/...` | 301 (vĩnh viễn) | Bản có www luôn chuyển về bản không www. |
| `/` | `/ngoi-nha-3-lop` | 302 (tạm thời) | Gốc tên miền sau này là trang chủ nhà chung. Hiện tạm đưa về workshop. |
| `/checkout` | `/ngoi-nha-3-lop/checkout` | 301 | Đường dẫn cũ. Giữ để link cũ không chết. Tham số trên link (orderId...) được giữ nguyên. |
| `/xac-nhan` | `/ngoi-nha-3-lop/xac-nhan` | 301 | Như trên. |
| `/giu-cho-thanh-cong` | `/ngoi-nha-3-lop/giu-cho-thanh-cong` | 301 | Trang cũ không còn dùng, giữ đường dẫn theo quy tắc không xóa. |
| `/config.js` | `/ngoi-nha-3-lop/config.js` | 301 | Đường dẫn cũ của file cấu hình. |
| `/assets/...` | `/ngoi-nha-3-lop/assets/...` | 301 | Đường dẫn cũ của ảnh. |

Quy tắc lâu dài: mỗi sản phẩm một đường dẫn phẳng đặt theo tên sản phẩm (không đặt theo vai trò, ngày hay giá). Không bao giờ xóa đường dẫn cũ; đổi tên thì thêm chuyển hướng 301.
