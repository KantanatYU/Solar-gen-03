function main() {
    const link = new WSLink();

    // ตัวแปรเก็บ "พลังงานสะสม" เริ่มต้นที่ 0
    let storedEnergy = 0;
    const MAX_ENERGY = 5000; // ความจุสูงสุดของหน้าปัด (Watts)

    let isCharging = false;
    let isExporting = false;

    // 1. ระบบ Monitoring: คำนวณพลังงานสะสมทุกๆ 0.2 วินาที
    setInterval(() => {
        link.adcGet(0, (uid, value, error) => {
            if (error == null) {
                // อัตราการชาร์จ: ปรับตัวหารให้น้อยลง และบวกค่าพื้นฐาน เพื่อให้ชาร์จเร็วขึ้น
                let chargeRate = (value / 25) + 10; 

                // อัตราการใช้ไฟ: ปรับลดตัวเลขดึงไฟออก เพื่อไม่ให้เกจลดเร็วเกินไป
                let drainRate = 0;
                if (isCharging) drainRate += 20;  // กดชาร์จแบต ดึงไฟออกรอบละ 20
                if (isExporting) drainRate += 30; // กดจ่ายไฟออก ดึงไฟออกรอบละ 30

                // คำนวณพลังงานสะสมปัจจุบัน (ของเดิม + ชาร์จเข้า - จ่ายออก)
                storedEnergy = storedEnergy + chargeRate - drainRate;

                // ตรวจสอบไม่ให้พลังงานทะลุหลอด 5000 หรือติดลบ
                if (storedEnergy > MAX_ENERGY) storedEnergy = MAX_ENERGY;
                if (storedEnergy < 0) storedEnergy = 0;

                // อัปเดตตัวเลขบนหน้าจอ
                document.getElementById("wattVal").textContent = Math.round(storedEnergy).toLocaleString();
                
                // อัปเดตเกจวัดพลังงาน (องศาการหมุน)
                let rotation = (storedEnergy / MAX_ENERGY) * 180;
                document.getElementById("gaugeFill").style.transform = `rotate(${rotation}deg)`;
            }
        });
    }, 200); 

    // 2. ควบคุมโหลดชาร์จแบตฯ (เชื่อมกับ LED 0)
    document.getElementById("btnCharge").addEventListener("click", function() {
        isCharging = !isCharging;
        if (isCharging) {
            link.ledSet(0);
            this.textContent = "STOP CHARGING";
            this.className = "on";
            document.getElementById("led0Dot").classList.add("active");
        } else {
            link.ledClr(0);
            this.textContent = "TOGGLE CHARGING";
            this.className = "";
            document.getElementById("led0Dot").classList.remove("active");
        }
    });

    // 3. ควบคุมโหลดจ่ายไฟ (เชื่อมกับ LED 1)
    document.getElementById("btnExport").addEventListener("click", function() {
        isExporting = !isExporting;
        if (isExporting) {
            link.ledSet(1);
            this.textContent = "STOP EXPORT";
            this.className = "on";
            document.getElementById("led1Dot").classList.add("active");
        } else {
            link.ledClr(1);
            this.classList.remove("on");
            this.className = "";
            this.textContent = "TOGGLE EXPORT";
            document.getElementById("led1Dot").classList.remove("active");
        }
    });
}