const ContactSection = () => {
  return (
    <section id="contact" className="bg-[#0b0f16] text-white">

      <div className="py-16 px-5">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-[#9c8251] text-lg tracking-wide mb-2">
            CONTACT
          </h2>

          <h1 className="text-2xl sm:text-4xl font-semibold">
            ช่องทางติดต่อ
          </h1>

          <p className="text-gray-500 mt-4 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            สามารถติดต่อเราได้ผ่านช่องทางด้านล่างสำหรับการจองห้องพัก
            หรือสอบถามข้อมูลเพิ่มเติม
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">

          <div className="bg-[#121826] border border-[#1f2937] rounded-sm p-6">
            <h3 className="text-[#9c8251] font-semibold mb-3">📍 ที่อยู่</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Thailand 
            </p>
          </div>

          <div className="bg-[#121826] border border-[#1f2937] rounded-sm p-6">
            <h3 className="text-[#9c8251] font-semibold mb-3">📞 โทร</h3>
            <a href="tel:+66981234567" className="text-gray-400 hover:text-[#9c8251]">
              0657064678
            </a>
          </div>

          <div className="bg-[#121826] border border-[#1f2937] rounded-sm p-6">
            <h3 className="text-[#9c8251] font-semibold mb-3">✉️ อีเมล</h3>
            <a href="mailto:contact@hotel.com" className="text-gray-400 hover:text-[#9c8251]">
              gitgit13767@gmail.com
            </a>
          </div>

          <div className="bg-[#121826] border border-[#1f2937] rounded-sm p-6">
            <h3 className="text-[#9c8251] font-semibold mb-3">💬 Social</h3>

            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <a href="https://www.facebook.com/profile.php?id=61587695670261" target="_blank" className="hover:text-[#9c8251]">
                Facebook Page
              </a>

              <a href="https://www.facebook.com/boorapa.youpoung/" target="_blank" className="hover:text-[#9c8251]">
                Facebook Messenger
              </a>
            </div>
          </div>

        </div>
      </div>

      <footer className="border-t border-[#1f2937] bg-[#0a0e14] px-5 py-10">

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between gap-8">

          <div>
            <h2 className="text-[#9c8251] text-lg font-semibold">
              Hotel Management System
            </h2>
            <p className="text-gray-500 text-sm mt-2 max-w-md">
              ระบบจัดการโรงแรมที่ออกแบบมาเพื่อความง่าย ความเร็ว
              และการควบคุมทุกอย่างในที่เดียว
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm text-gray-400">
            <a href="#hero" className="hover:text-[#9c8251] transition">Home</a>
            <a href="#rooms" className="hover:text-[#9c8251] transition">Rooms</a>
            <a href="#about" className="hover:text-[#9c8251] transition">About</a>
            <a href="#contact" className="hover:text-[#9c8251] transition">Contact</a>
          </div>

        </div>

        <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-[#1f2937] text-center text-xs text-gray-600">
          © {new Date().getFullYear()} Hotel Management System — All rights reserved
        </div>

      </footer>

    </section>
  )
}

export default ContactSection