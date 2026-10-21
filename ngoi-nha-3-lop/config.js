// ============================================================
// CẤU HÌNH TRANG — Thắm chỉ cần sửa ở file này
// ============================================================
window.APP_CONFIG = {
  // Tên miền chính và đường dẫn workshop: đổi ở đây (và ở các thẻ canonical, og:url, og:image trong index.html)
  SITE_URL: 'https://thantamcanh.com',
  DUONG_DAN_WORKSHOP: '/ngoi-nha-3-lop',

  LINK_NHOM_LOP: 'https://zalo.me/g/afweoiaxvoywcsm4nsxh',   // nhóm lớp (vé miễn phí)
  LINK_NHOM_VIP: 'https://zalo.me/g/hh6v7z42bcuiz7jio8au',   // nhóm VIP 21 ngày (vé VIP đã thanh toán)
  PIXEL_ID: '26885894507775293',
  GIO_HOC: '20h',

  // Quà cho khách mua VIP trong 60 phút (tính từ lúc đăng ký đầu tiên). Giá 99K vẫn giữ đến 23h59 tối Buổi 2.
  // CHỈ đổi BAT thành true khi file quà đã có sẵn VÀ email tự gửi quà đã chạy (Apps Script).
  // Trang hứa tặng quà mà khách không nhận được là vi phạm chính sách Meta.
  QUA_VIP: {
    BAT: false,
    SO_PHUT: 60,
    TEN: 'Bộ Thực Đơn 7 Ngày Bữa Cơm Gia Đình',
    MO_TA: 'Kèm danh sách đi chợ. Cả nhà ăn chung một mâm, bạn không phải nấu riêng.'
  },

  // Nhịp đợt: 2 tháng 1 đợt (tháng 1, 3, 5, 7, 9, 11), Buổi 1 = Thứ Ba thứ 3 của tháng (luôn rơi vào ngày 15–21:
  // đúng giữa tháng, các khoản đầu tháng đã đóng xong, xa áp lực cuối tháng). Muốn mỗi tháng 1 đợt thì đổi CACH_THANG thành 1.
  LICH: {
    THANG_DAU: '2027-01',   // tháng của đợt đầu tiên theo nhịp mới
    CACH_THANG: 2,          // 2 = cứ 2 tháng 1 đợt
    THU_BA_THU: 3           // Buổi 1 là Thứ Ba thứ mấy trong tháng
  },

  // Ngày đặc biệt, ưu tiên hơn nhịp ở trên. Mẫu:
  //   { thang: "2027-03", nghi: true }            → tháng đó không có đợt, trang tính sang đợt kế tiếp.
  //   { thang: "2027-04", buoi1: "2027-04-20" }   → tháng đó học Thứ Ba 20/4, Thứ Tư 21/4, Thứ Năm 22/4 (kể cả tháng không nằm trong nhịp).
  LICH_NGOAI_LE: [
    { thang: "2026-10", buoi1: "2026-10-27" }    // đợt đang bán, giữ nguyên vì đã cận ngày (tháng 10 không nằm trong nhịp tháng lẻ)
  ]
};

// ============================================================
// LỊCH HỌC TỰ ĐỘNG
// Buổi 1 theo APP_CONFIG.LICH (Thứ Ba thứ 3 của tháng lẻ) hoặc LICH_NGOAI_LE, Buổi 2 = hôm sau, Buổi 3 = 2 ngày sau.
// Mốc chuyển sang đợt kế tiếp (tham số loaiVe):
//   - 'free' (vé miễn phí): 19h00 Thứ Ba, ngày Buổi 1 → đăng ký từ giờ đó được xếp vào đợt sau.
//   - mặc định / 'vip': 19h00 Thứ Năm, ngày Buổi 3 → vẫn bán vé VIP đợt này trong lúc học Buổi 1 và 2.
// Mọi phép tính theo giờ Việt Nam (UTC+7), không phụ thuộc múi giờ máy của khách.
// ============================================================
window.tinhDotKeTiep = function (now, loaiVe) {
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
    var lich = window.APP_CONFIG.LICH || {};
    var dau = String(lich.THANG_DAU || '2027-01').split('-');
    var cach = lich.CACH_THANG || 1;
    var lech = (year - +dau[0]) * 12 + (month - (+dau[1] - 1));
    if (lech < 0 || lech % cach !== 0) return null;
    var first = new Date(Date.UTC(year, month, 1));
    var toFirstTuesday = (2 - first.getUTCDay() + 7) % 7;
    return new Date(Date.UTC(year, month, 1 + toFirstTuesday + 7 * ((lich.THU_BA_THU || 2) - 1)));
  }

  for (var i = 0; i < 36; i++) {
    var yy = y + Math.floor((m + i) / 12);
    var mm = (m + i) % 12;
    var b1 = buoi1Cua(yy, mm);
    if (!b1) continue;
    var cutoff = loaiVe === 'free'
      ? b1.getTime() + 19 * 3600 * 1000               // 19h00 Thứ Ba (ngày Buổi 1)
      : b1.getTime() + 2 * DAY + 19 * 3600 * 1000;    // 19h00 Thứ Năm (ngày Buổi 3)
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

/** Đợt liền sau đợt d (dùng khi đợt d đã đủ vé miễn phí). 12:00 UTC = 19h giờ Việt Nam ngày Buổi 1. */
window.tinhDotSau = function (d) {
  if (!d) return null;
  return window.tinhDotKeTiep(new Date(Date.parse(d.ngay[0] + 'T12:00:00Z') + 60000), 'free');
};

// ============================================================
// QUÀ VIP 60 PHÚT — hiện quà và đồng hồ đếm ngược (chỉ khi QUA_VIP.BAT = true)
// han = thời điểm hết hạn nhận quà (mili giây), tính từ lúc khách đăng ký lần đầu, lưu cùng đơn trong phiên.
// Đồng hồ chạy theo giờ thật nên tải lại trang không quay về 60 phút. Máy chủ mới là nơi quyết định có gửi quà hay không.
// ============================================================
window.quaVipHan = function () {
  var q = window.APP_CONFIG.QUA_VIP || {};
  return Date.now() + (q.SO_PHUT || 60) * 60000;
};

/** Điền tên + mô tả quà vào mọi khối [data-qua] trong trang và cho hiện. Trả về false nếu quà đang tắt. */
window.hienKhoiQua = function () {
  var q = window.APP_CONFIG.QUA_VIP || {};
  if (!q.BAT) return false;
  document.querySelectorAll('[data-qua]').forEach(function (el) {
    el.querySelectorAll('.qua-ten').forEach(function (x) { x.textContent = q.TEN; });
    el.querySelectorAll('.qua-mo-ta').forEach(function (x) { x.textContent = q.MO_TA; });
    el.querySelectorAll('.qua-so-phut').forEach(function (x) { x.textContent = q.SO_PHUT || 60; });
    el.hidden = false;
  });
  return true;
};

/** Đồng hồ đếm ngược trong el tới thời điểm han. chuCon(mm:ss) và chuHet là chữ hiển thị. */
window.demNguocQua = function (el, han, chuCon, chuHet) {
  if (!el || !han) return;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ve() {
    var con = Math.floor((han - Date.now()) / 1000);
    if (con <= 0) { el.textContent = chuHet; el.classList.add('het'); clearInterval(t); return; }
    el.textContent = chuCon(pad(Math.floor(con / 60)) + ':' + pad(con % 60));
  }
  var t = setInterval(ve, 1000);
  ve();
};
