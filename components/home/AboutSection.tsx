const AboutSection = () => {
  return (
    <section className="bg-[#161b24] py-16 px-5 text-white">

      <div className="max-w-5xl mx-auto text-center mb-12">
        <h2 className="text-[#9c8251] text-lg mb-2 tracking-wide">
          ABOUT US
        </h2>

        <h1 className="text-2xl sm:text-4xl font-semibold">
          ระบบจัดการโรงแรมระดับมืออาชีพ
        </h1>

        <p className="text-gray-500 mt-4 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          ระบบนี้ถูกออกแบบมาเพื่อช่วยให้การบริหารห้องพัก การจอง และการเช็คเอาท์
          เป็นเรื่องง่าย สะดวก และแม่นยำในทุกขั้นตอน
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

        <div className="bg-[#1e2535] border border-[#2a3347] rounded-sm p-5 hover:border-[#9c8251] transition">
          <h3 className="text-[#9c8251] font-semibold mb-2">
            🏨 จัดการห้องพัก
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            เพิ่ม แก้ไข เปิด/ปิดห้อง และจัดการสถานะห้องแบบเรียลไทม์
            รองรับระบบโรงแรมจริง
          </p>
        </div>

        <div className="bg-[#1e2535] border border-[#2a3347] rounded-sm p-5 hover:border-[#9c8251] transition">
          <h3 className="text-[#9c8251] font-semibold mb-2">
            📅 ระบบจองห้อง
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            ตรวจสอบห้องว่างตามวัน เช็คอิน–เช็คเอาท์ และจัดการการจองแบบแม่นยำ
          </p>
        </div>

        <div className="bg-[#1e2535] border border-[#2a3347] rounded-sm p-5 hover:border-[#9c8251] transition">
          <h3 className="text-[#9c8251] font-semibold mb-2">
            ⚡ อัปเดตเรียลไทม์
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            สถานะห้องเปลี่ยนทันที เช่น ว่าง / เข้าพัก / ไม่สะอาด / ปิดซ่อม
          </p>
        </div>

      </div>

      <div className="max-w-5xl mx-auto mt-12 bg-[#1e2535] border border-[#9c8251]/40 rounded-sm p-6 text-center">
        <p className="text-gray-400 text-sm leading-relaxed">
          ✨ ออกแบบสำหรับโรงแรม รีสอร์ท และอพาร์ทเมนต์
          เพื่อให้การจัดการทุกอย่าง “ง่ายขึ้นในระบบเดียว”
        </p>
      </div>

    </section>
  )
}

export default AboutSection