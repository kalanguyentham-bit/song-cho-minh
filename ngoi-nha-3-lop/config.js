// ============================================================
// CẤU HÌNH TRANG — Thắm chỉ cần sửa ở file này
// ============================================================
window.APP_CONFIG = {
  // Tên miền chính và đường dẫn workshop: đổi ở đây (và ở các thẻ canonical, og:url, og:image trong index.html)
  SITE_URL: 'https://thantamcanh.com',
  DUONG_DAN_WORKSHOP: '/ngoi-nha-3-lop',

  LINK_NHOM_LOP: 'https://zalo.me/g/afweoiaxvoywcsm4nsxh',
  PIXEL_ID: '3416020051935979',
  GIO_HOC: '20h',

  // Ngày đặc biệt (ban đầu để trống). Sao chép 1 trong 2 dòng mẫu bên dưới khi cần:
  //   { thang: "2027-01", nghi: true }            → tháng đó không có đợt, trang tính sang tháng sau.
  //   { thang: "2027-04", buoi1: "2027-04-20" }   → tháng đó học Thứ Ba 20/4, Thứ Tư 21/4, Thứ Năm 22/4 thay cho ngày tự tính.
  LICH_NGOAI_LE: [
    // { thang: "2027-01", nghi: true },
    // { thang: "2027-04", buoi1: "2027-04-20" },
  ]
};

// ============================================================
// LỊCH HỌC TỰ ĐỘNG
// Buổi 1 = Thứ Ba thứ 4 của tháng (luôn rơi vào ngày 22–28), Buổi 2 = hôm sau, Buổi 3 = 2 ngày sau.
// Mốc chuyển đợt: 19h00 Thứ Năm (Buổi 3) của đợt tháng hiện tại → từ đó trang hiển thị đợt tháng kế tiếp.
// Mọi phép tính theo giờ Việt Nam (UTC+7), không phụ thuộc múi giờ máy của khách.
// ============================================================
window.tinhDotKeTiep = function (now) {
  now = now || new Date();
  var exceptions = window.APP_CONFIG.LICH_NGOAI_LE || [];
  var DAY = 86400000;
  var WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  // "Đồng hồ treo tường" Việt Nam: dịch +7h rồi đọc bằng các hàm getUTC*
  var vn = new Date(now.getTime() + 7 * 3600 * 1000);
  var y = vn.getUTCFullYear();
  var m = vn.getUTCMonth();

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
  function label(d) { return WEEKDAYS[d.getUTCDay()] + ', ' + d.getUTCDate() + '/' + (d.getUTCMonth() + 1); }

  function buoi1Cua(year, month) {
    var key = year + '-' + pad(month + 1);
    for (var i = 0; i < exceptions.length; i++) {
      if (exceptions[i].thang === key) {
        if (exceptions[i].nghi) return null;
        if (exceptions[i].buoi1) {
          var p = exceptions[i].buoi1.split('-');
          return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
        }
      }
    }
    var first = new Date(Date.UTC(year, month, 1));
    var toFirstTuesday = (2 - first.getUTCDay() + 7) % 7;
    return new Date(Date.UTC(year, month, 1 + toFirstTuesday + 21));
  }

  for (var i = 0; i < 36; i++) {
    var yy = y + Math.floor((m + i) / 12);
    var mm = (m + i) % 12;
    var b1 = buoi1Cua(yy, mm);
    if (!b1) continue;
    var cutoff = b1.getTime() + 2 * DAY + 19 * 3600 * 1000; // 19h00 Thứ Năm
    if (vn.getTime() < cutoff) {
      var b2 = new Date(b1.getTime() + DAY);
      var b3 = new Date(b1.getTime() + 2 * DAY);
      return {
        dot: yy + '-' + pad(mm + 1),
        ngay: [iso(b1), iso(b2), iso(b3)],
        label: [label(b1), label(b2), label(b3)]
      };
    }
  }
  return null;
};
