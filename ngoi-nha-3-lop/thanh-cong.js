// ============================================================
// KHỐI "GIỮ CHỖ THÀNH CÔNG" — dùng chung cho trang cảm ơn vé miễn phí (index.html) và trang xác nhận VIP (xac-nhan.html)
// Cần config.js tải trước. Ngày giờ các buổi lấy từ đợt d (kết quả tinhDotKeTiep), không gõ cứng.
// Lịch không bao giờ chứa link Zoom: link phòng chỉ gửi trong nhóm Zalo lúc 19h mỗi ngày học.
// ============================================================
(function () {
  var CFG = window.APP_CONFIG || {};
  var TEN_BUOI = ['Buổi 1 · Nền móng: Cơ Thể', 'Buổi 2 · Kết cấu: Niềm Tin', 'Buổi 3 · Ngôi nhà: Không Gian'];
  var GHI_CHU_LICH = 'Link phòng gửi trong nhóm Zalo lúc 19h';
  var QR_THU_VIEN = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  /** Mili giây → '20261027T130000Z' (giờ UTC, dạng Google Calendar và file .ics dùng) */
  function utc(ms) { return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }

  /** Các buổi của hạng vé: miễn phí Buổi 1, 2; VIP cả 3. Giờ học theo GIO_HOC (20h) giờ Việt Nam, dài PHUT_MOI_BUOI phút. */
  window.cacBuoiCuaVe = function (d, laVip) {
    if (!d) return [];
    var gio = parseInt(CFG.GIO_HOC, 10) || 20, phut = CFG.PHUT_MOI_BUOI || 90;
    var ds = [];
    for (var i = 0; i < (laVip ? 3 : 2); i++) {
      var batDau = Date.parse(d.ngay[i] + 'T' + pad(gio) + ':00:00+07:00');
      ds.push({ so: i + 1, ten: TEN_BUOI[i], iso: d.ngay[i], label: d.label[i], batDau: batDau, ketThuc: batDau + phut * 60000 });
    }
    return ds;
  };

  function gioVn(ms) { var t = new Date(ms + 7 * 3600000); return pad(t.getUTCHours()) + ':' + pad(t.getUTCMinutes()); }

  window.linkGoogleCalendar = function (b) {
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent('Ngôi Nhà 3 Lớp · ' + b.ten) +
      '&dates=' + utc(b.batDau) + '/' + utc(b.ketThuc) +
      '&details=' + encodeURIComponent(GHI_CHU_LICH) +
      '&location=' + encodeURIComponent('Zoom');
  };

  // ---------- File .ics (Lịch iPhone) tạo ngay trên máy khách ----------
  function icsChu(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
  /** Gập dòng dài quá 75 byte (quy tắc của file .ics), không cắt đôi chữ có dấu. */
  function gapDong(dong) {
    var ra = [], cur = '', soByte = 0;
    Array.from(dong).forEach(function (ch) {
      var b = unescape(encodeURIComponent(ch)).length;
      if (soByte + b > (ra.length ? 74 : 75)) { ra.push(cur); cur = ''; soByte = 0; }
      cur += ch; soByte += b;
    });
    ra.push(cur);
    return ra.join('\r\n ');
  }
  window.taoFileIcs = function (ds) {
    var dong = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Song Theo Lua Chon//Ngoi Nha 3 Lop//VI', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Ngôi Nhà 3 Lớp'];
    var bayGio = utc(Date.now());
    ds.forEach(function (b) {
      dong.push('BEGIN:VEVENT',
        'UID:ngoi-nha-3-lop-' + b.iso + '-buoi-' + b.so + '@thantamcanh.com',
        'DTSTAMP:' + bayGio,
        'DTSTART:' + utc(b.batDau),
        'DTEND:' + utc(b.ketThuc),
        'SUMMARY:' + icsChu('Ngôi Nhà 3 Lớp · ' + b.ten),
        'DESCRIPTION:' + icsChu(GHI_CHU_LICH),
        'LOCATION:Zoom',
        'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsChu('1 tiếng nữa: Ngôi Nhà 3 Lớp · ' + b.ten), 'TRIGGER:-PT60M', 'END:VALARM',
        'END:VEVENT');
    });
    dong.push('END:VCALENDAR');
    return dong.map(gapDong).join('\r\n') + '\r\n';
  };
  /** iPhone/iPad: mở file lịch để máy hiện "Thêm tất cả vào Lịch". Máy khác: tải file ngoi-nha-3-lop.ics. */
  window.taiLichIcs = function (ds) {
    var ics = window.taoFileIcs(ds);
    var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (iOS) {
      var duLieu = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
      if (!window.open(duLieu, '_blank')) location.href = duLieu;
      return;
    }
    var url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    var a = document.createElement('a');
    a.href = url; a.download = 'ngoi-nha-3-lop.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
  };

  // ---------- Đánh dấu bước trên thanh 3 bước ----------
  function xongBuoc(hop, so) {
    var li = hop.querySelector('.tc-buoc li[data-buoc="' + so + '"]');
    if (!li || li.classList.contains('xong')) return;
    li.classList.add('xong');
    li.textContent = '✓ ' + li.textContent.replace(/^\d+\.\s*/, '');
  }

  /** Điền danh sách buổi + nút Google Calendar + nút tải lịch iPhone vào khối .tc-lich trong hop. */
  window.veKhoiLich = function (hop, d, laVip) {
    var ds = window.cacBuoiCuaVe(d, laVip);
    var khoi = hop.querySelector('.tc-lich');
    if (!khoi || !ds.length) return;
    khoi.querySelector('.tc-lich-ds').innerHTML = ds.map(function (b) {
      return '<li><div><b>' + esc(b.ten) + '</b><span>' + gioVn(b.batDau) + '–' + gioVn(b.ketThuc) + ', ' + esc(b.label) + '</span></div>' +
        '<a class="tc-gcal" href="' + esc(window.linkGoogleCalendar(b)) + '" target="_blank" rel="noopener">Thêm vào Google Calendar</a></li>';
    }).join('');
    khoi.querySelectorAll('.tc-gcal').forEach(function (a) { a.addEventListener('click', function () { xongBuoc(hop, 3); }); });
    khoi.querySelector('.tc-ics').onclick = function () { window.taiLichIcs(ds); xongBuoc(hop, 3); };
  };

  /** Nút Zalo: gắn link, bấm thì đánh dấu bước 2. QR chỉ vẽ trên màn hình rộng (máy tính). */
  window.ganNutZalo = function (hop, href, linkQr) {
    var nut = hop.querySelector('.tc-zalo');
    if (!nut) return;
    if (href) nut.href = href;
    if (!nut._daGan) { nut._daGan = true; nut.addEventListener('click', function () { xongBuoc(hop, 2); }); }
    if (linkQr) veQr(hop.querySelector('.tc-qr-hop'), linkQr);
  };

  var qrCho = null;
  function veQr(hop, text) {
    if (!hop || !window.matchMedia('(min-width: 768px)').matches) return;
    function ve() {
      var o = hop.querySelector('.tc-qr');
      o.innerHTML = '';
      new window.QRCode(o, { text: text, width: 148, height: 148, correctLevel: window.QRCode.CorrectLevel.M });
      hop.hidden = false;
    }
    if (window.QRCode) return ve();
    qrCho = ve;
    if (document.getElementById('tcQrThuVien')) return;
    var s = document.createElement('script');
    s.id = 'tcQrThuVien'; s.src = QR_THU_VIEN; s.async = true;
    s.onload = function () { if (qrCho) qrCho(); };
    document.head.appendChild(s);
  }

  function idYoutube(u) {
    u = String(u || '').trim();
    var m = u.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/|live\/)([\w-]{11})/);
    return m ? m[1] : (/^[\w-]{11}$/.test(u) ? u : '');
  }
  /** Khối quà trong buổi (QUA_TRONG_BUOI) và video chào (VIDEO_CHAO): để trống trong config.js thì ẩn. */
  window.veQuaVaVideo = function (hop) {
    var qua = hop.querySelector('.tc-qua'), chu = String(CFG.QUA_TRONG_BUOI || '').trim();
    if (qua) { qua.hidden = !chu; qua.querySelector('.tc-qua-chu').textContent = chu; }
    var video = hop.querySelector('.tc-video'), id = idYoutube(CFG.VIDEO_CHAO);
    if (video) {
      video.hidden = !id;
      var khung = video.querySelector('.tc-video-khung');
      if (id && !khung.querySelector('iframe')) {
        khung.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?rel=0" title="Lời chào từ Thắm" loading="lazy" ' +
          'allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
      }
    }
  };

  // ---------- Giao diện (dùng chung 2 trang) ----------
  var css = [
    '.tc-buoc { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px; margin: 0; padding: 0; list-style: none; }',
    '.tc-buoc li { font-size: 11.5px; font-weight: 600; color: #8A756A; background: #F4ECE5; border-radius: 100px; padding: 4px 8px; line-height: 1.3; white-space: nowrap; }',
    '.tc-buoc li.dang { background: #E5F0FF; color: #0050C8; box-shadow: inset 0 0 0 1.5px #0068FF; }',
    '.tc-buoc li.xong { background: #E3F3E6; color: #23743A; box-shadow: none; }',
    '.tc-tieu-de { font-family: inherit; font-size: 22px; line-height: 1.3; color: #2E2420; margin: 0; }',
    '.tc-phu { font-size: 15px; line-height: 1.55; color: #5A4B44; margin: 0; }',
    '.tc-zalo { display: block; width: 100%; box-sizing: border-box; background: #0068FF; color: #FFFFFF !important; font-weight: 700; font-size: 18px; line-height: 1.3; padding: 18px 16px; border-radius: 100px; text-align: center; text-decoration: none; box-shadow: 0 6px 18px rgba(0,104,255,0.32); }',
    '.tc-zalo:hover { background: #0052CC; }',
    '.tc-zalo-ghi-chu { font-size: 13px; color: #5A4B44; margin: -4px 0 0; line-height: 1.5; }',
    '.tc-qr-hop { display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 12.5px; color: #8A756A; }',
    '.tc-qr-hop[hidden] { display: none; }',
    '.tc-qr { background: #FFFFFF; padding: 8px; border: 1px solid #EFE2D6; border-radius: 10px; }',
    '.tc-khoi { width: 100%; box-sizing: border-box; background: #FAF3EC; border: 1px solid #EFE2D6; border-radius: 14px; padding: 14px; text-align: left; font-size: 14.5px; line-height: 1.55; color: #3A2E2A; }',
    '.tc-khoi[hidden] { display: none; }',
    '.tc-khoi-tieu-de { font-weight: 700; font-size: 15.5px; color: #2E2420; margin-bottom: 8px; }',
    '.tc-khoi p { margin: 0; }',
    '.tc-lich-ds { list-style: none; margin: 0 0 10px; padding: 0; display: flex; flex-direction: column; gap: 10px; }',
    '.tc-lich-ds li { display: flex; flex-direction: column; gap: 6px; background: #FFFFFF; border-radius: 10px; padding: 10px 12px; }',
    '.tc-lich-ds b { display: block; font-size: 14.5px; color: #2E2420; }',
    '.tc-lich-ds span { font-size: 14px; color: #5A4B44; }',
    '.tc-gcal { align-self: flex-start; font-size: 14px; font-weight: 700; color: #1A73E8 !important; text-decoration: none; border: 1.5px solid #1A73E8; border-radius: 100px; padding: 7px 14px; }',
    '.tc-ics { width: 100%; background: #FFFFFF; color: #2E2420; border: 1.5px solid #2E2420; border-radius: 100px; padding: 11px; font-size: 14.5px; font-weight: 700; font-family: inherit; cursor: pointer; }',
    '.tc-video-khung { position: relative; width: 100%; padding-top: 56.25%; border-radius: 10px; overflow: hidden; background: #000; }',
    '.tc-video-khung iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }',
    '.tc-thu-rac { font-size: 13px; color: #8A756A; font-style: italic; line-height: 1.5; margin: 0; }'
  ].join('\n');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);
})();
