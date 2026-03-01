# คู่มือการติดตั้งและใช้งาน (Installation Guide)

โปรแกรมนี้ได้รับการพัฒนาด้วย **Vite + React + Tailwind CSS** ซึ่งเป็นเทคโนโลยีที่ทันสมัยและมีประสิทธิภาพสูง

## วิธีการใช้งาน (How to Run)

เนื่องจากโปรแกรมนี้เป็นเว็บแอปพลิเคชันสมัยใหม่ คุณจำเป็นต้องติดตั้ง **Node.js** ก่อนเพื่อใช้งาน

### 1. ติดตั้ง Node.js

หากเครื่องของคุณยังไม่ได้ติดตั้ง Node.js กรุณาดาวน์โหลดและติดตั้งจากลิงก์ด้านล่าง:

- [ดาวน์โหลด Node.js (แนะนำรุ่น LTS)](https://nodejs.org/)

### 2. ติดตั้ง Dependencies

เปิด Terminal (หรือ Command Prompt) ในโฟลเดอร์นี้แล้วพิมพ์คำสั่ง:

```bash
npm install
```

### 3. เริ่มใช้งานโปรแกรม

เมื่อติดตั้งเสร็จแล้ว ให้พิมพ์คำสั่งเพื่อเริ่มเซิร์ฟเวอร์จำลอง:

```bash
npm run dev
```

หลังจากนั้นให้เปิด Browser ไปที่ลิงก์ที่แสดงในหน้าจอ (ปกติคือ `http://localhost:5173`)

---

## คุณสมบัติเด่น (Key Features)

- **Dashboard**: สรุปภาพรวมที่นั่ง ส.ส. และสถิติสำคัญแบบ Real-time
- **Simulation**: จำลองการเลือกตั้งโดยละเอียดรายจังหวัด ปรับแต่งการโอนคะแนนได้อิสระ
- **Scenarios**: ระบบบันทึกสถานการณ์เพื่อนำกลับมาวิเคราะห์ภายหลัง
- **Monte Carlo**: จำลองสถานการณ์ด้วยหลักความน่าจะเป็น (Probability) 1,000+ รอบ
- **Responsive Design**: รองรับทั้ง Dark Mode และ Light Mode พร้อมดีไซน์แบบ Glassmorphism สุดพรีเมียม

## รายละเอียดทางเทคนิค

- **State Management**: Zustand with Persistence
- **Animations**: Framer Motion
- **Charts**: Chart.js (React Chartjs 2)
- **Styling**: Tailwind CSS
