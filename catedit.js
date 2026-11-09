/* catedit.js - แก้ไขหมวดหมู่ (ชื่อ / ไอคอน / สี / ประเภท)
   แยกเป็นไฟล์ของตัวเอง ไม่พึ่งการเขียนทับฟังก์ชันอื่น: คอยดูรายการหมวดหมู่แล้วเติมปุ่ม "แก้ไข" ให้เอง */
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }

  var editId = null;

  function card() { var m = $('modal-category'); return m ? m.querySelector('.card') : null; }
  function submitBtn() { var m = $('modal-category'); return m ? m.querySelector('button[onclick="submitCustomCategory()"]') : null; }

  function resetForm() {
    editId = null;
    var c = card(); if (!c) return;
    var h = c.querySelector('h4'); if (h) h.textContent = '➕ เพิ่มหมวดหมู่ใหม่';
    var b = submitBtn(); if (b) b.textContent = 'บันทึกหมวดหมู่';
    var x = $('fx-cat-cancel'); if (x) x.style.display = 'none';
  }

  function ensureCancel() {
    if ($('fx-cat-cancel')) return;
    var b = submitBtn(); if (!b) return;
    var x = document.createElement('button');
    x.id = 'fx-cat-cancel'; x.type = 'button'; x.className = 'btn-danger';
    x.style.display = 'none'; x.textContent = 'ยกเลิกการแก้ไข';
    x.addEventListener('click', function () { resetForm(); var n = $('new-cat-name'); if (n) n.value = ''; });
    b.parentNode.insertBefore(x, b.nextSibling);
  }

  function startEdit(id) {
    var cat = (typeof getCategoryById === 'function') ? getCategoryById(id) : null;
    if (!cat) return;
    ensureCancel();
    editId = id;
    appState.selectedNewEmoji = cat.icon;
    appState.selectedNewColor = cat.color;
    if (typeof setNewCatType === 'function') setNewCatType(cat.type === 'Income' ? 'Income' : 'Expense');
    $('new-cat-name').value = cat.name;
    if (typeof populateIconPicker === 'function') populateIconPicker();
    if (typeof populateColorPicker === 'function') populateColorPicker();
    var c = card();
    var h = c && c.querySelector('h4'); if (h) h.textContent = '✏️ แก้ไขหมวดหมู่';
    var b = submitBtn(); if (b) b.textContent = 'บันทึกการแก้ไข';
    var x = $('fx-cat-cancel'); if (x) x.style.display = 'block';
    var mc = $('modal-category').querySelector('.modal-content'); if (mc) mc.scrollTop = 0;
    $('new-cat-name').focus();
  }

  /* เติมปุ่ม "แก้ไข" ข้างปุ่มลบ ในทุกแถวของรายการหมวดหมู่ */
  function decorate() {
    var box = $('cat-manager-list'); if (!box) return;
    Array.prototype.forEach.call(box.children, function (row) {
      if (row.querySelector('.fx-cat-edit')) return;
      var del = null, id = null;
      Array.prototype.forEach.call(row.querySelectorAll('button'), function (btn) {
        var m = /deleteCustomCategory\('([^']+)'\)/.exec(btn.getAttribute('onclick') || '');
        if (m) { del = btn; id = m[1]; }
      });
      if (!del) return;
      var wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;align-items:center;gap:2px;flex-shrink:0';
      var ed = document.createElement('button');
      ed.type = 'button'; ed.className = 'fx-cat-edit';
      ed.innerHTML = '<i class="fa-solid fa-pen"></i> แก้ไข';
      ed.style.cssText = 'background:none;border:none;color:var(--primary-hover);font-weight:bold;cursor:pointer;padding:4px';
      ed.addEventListener('click', function (e) { e.stopPropagation(); startEdit(id); });
      del.parentNode.insertBefore(wrap, del);
      wrap.appendChild(ed);
      wrap.appendChild(del);
    });
  }

  function save() {
    var name = $('new-cat-name').value.trim();
    if (!name) { showError('กรุณากรอกชื่อหมวดหมู่'); return; }
    var id = editId;
    var data = { name: name, icon: appState.selectedNewEmoji, color: appState.selectedNewColor, type: appState.newCatType };
    showLoading('กำลังบันทึกการแก้ไข...');
    google.script.run
      .withSuccessHandler(function (cats) {
        appState.categories = cats;
        if (typeof syncCategoriesToCache === 'function') syncCategoriesToCache(cats);
        resetForm();
        $('new-cat-name').value = '';
        if (typeof loadCategoryManagerList === 'function') loadCategoryManagerList();
        decorate();
        ['updateDashboardUI', 'updateRecordsUI', 'updateChartsUI', 'updateReportsUI'].forEach(function (fn) {
          try { if (typeof window[fn] === 'function') window[fn](); } catch (e) {}
        });
        closeLoading();
        showSuccess('แก้ไขหมวดหมู่สำเร็จ!');
      })
      .withFailureHandler(function (err) {
        closeLoading();
        var m = (err && err.message) || '';
        showError(/Unknown function/i.test(m) ? 'ต้องอัปเดต Code.gs ใน Apps Script (เพิ่มฟังก์ชัน editCategory) แล้ว Deploy ใหม่ก่อน' : m);
      })
      .editCategory(id, data);
  }

  /* ดักการกดปุ่มบันทึกตอนอยู่ในโหมดแก้ไข (ก่อนที่ปุ่มจะทำงานแบบเพิ่มหมวดหมู่ใหม่) */
  document.addEventListener('click', function (e) {
    if (!editId || !e.target || !e.target.closest) return;
    var b = e.target.closest('button[onclick="submitCustomCategory()"]');
    if (!b) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    save();
  }, true);

  function watch() {
    var box = $('cat-manager-list');
    if (box) {
      new MutationObserver(decorate).observe(box, { childList: true });
      decorate();
    }
    var m = $('modal-category');
    if (m) {
      // ปิดหน้าต่างแล้วเปิดใหม่ ให้กลับเป็นโหมดเพิ่มหมวดหมู่ตามปกติ
      new MutationObserver(function () { if (!m.classList.contains('active')) resetForm(); })
        .observe(m, { attributes: true, attributeFilter: ['class'] });
    }
    ensureCancel();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
})();
