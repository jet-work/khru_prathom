-- Assign categories to the existing seeded equipment so the catalog can be
-- browsed/filtered by category. Best-effort grouping; admins can re-assign
-- individual items later via the equipment edit form.

update equipment set category = 'อุปกรณ์ครัว' where name in (
  'ขันน้ำใหญ่','ขันน้ำกลาง','ขันน้ำเล็ก','เหยือกน้ำ','แก้วน้ำ','ที่ตักน้ำแข็ง',
  'ขวดใส่ซอส','กระปุก','ช้อน/ซ้อม','ทัพพีโลหะ','ทัพพีไม้','ช้อนตักของหวาน',
  'กระชอน','มีด','กะละมังเหล็ก','กระทะเล็ก','จาน','จานกระดาษ','ถาดเหลี่ยม',
  'กระทะไฟฟ้าสีแดง','สลิง','คูลเลอร์','ปืนจุดไฟ'
);

update equipment set category = 'เครื่องเขียน' where name in (
  'ปากกา','ดินสอ','ยางลบ','กบเหลา','ไม้บรรทัด','ไม้บรรทัดเหล็ก','ไม้บรรทัดเหล็กยาว',
  'กระดาษ A4','โพสอิท','กรรไกร','แผนรองตัดกระดาษ','เทป','แลคซีน','กาวร้อน',
  'กาวขวดใหญ่','กาวขวดกลาง','กาวขวดเล็ก','กาวสองหน้าแบบหนา','ปืนกาว','ใส้แม็ก',
  'แม็กเย็บใหญ่','เข็มหมุด','เข็มกลัด','สายวัด'
);

update equipment set category = 'ศิลปะ/งานฝีมือ' where name in (
  'ปากกาเมจิก','ปากกาสี','สีไม้','สีน้ำ','ชอล์ก','จานสีใหญ่','จานสีเล็ก',
  'กลิตเตอร์','สเปรย์สี','สีเป็นถัง','ด้าย','หนวดกุ้ง','ลูกตาปลอม','ไม้ไอศกรีม',
  'แผนป้ายโชว์','หนังยาง','ตุ๊ดตู่'
);

update equipment set category = 'เครื่องมือช่าง' where name in (
  'คีม','ที่คีบ','มีดเหลาใหญ่','ไขควง','เลื่อยท่อ','ตะปู','แท่นปั๊มหมึก',
  'ตัวปั๊มหมึก','หวงเหล็ก'
);

update equipment set category = 'เครื่องเสียง/ดนตรี' where name in (
  'โทรโข่ง','ไมค์','กลอง'
);

update equipment set category = 'ความสะอาด' where name in (
  'ไม้กวาด','ไม้ถู'
);

update equipment set category = 'ปาร์ตี้/ตกแต่ง' where name in (
  'ที่สูบลูกโป่ง'
);

update equipment set category = 'ไฟฟ้า' where name in (
  'ปลั๊กพ่วง'
);
