const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const homeDir = os.homedir();
const userAgentsDir = path.join(homeDir, '.agents');
const targetSkillsDir = path.join(userAgentsDir, 'skills');
const targetRulesDir = path.join(userAgentsDir, 'rules');

console.log('🚀 [Lark Ticket Suite] Cài đặt Skills & Rules vào:', userAgentsDir);

// Đảm bảo thư mục đích tồn tại
if (!fs.existsSync(targetSkillsDir)) fs.mkdirSync(targetSkillsDir, { recursive: true });
if (!fs.existsSync(targetRulesDir)) fs.mkdirSync(targetRulesDir, { recursive: true });

const srcSkillsDir = path.join(__dirname, '..', 'skills');
const srcRulesDir = path.join(__dirname, '..', 'rules');

// 1. LIÊN KẾT SKILLS (Sử dụng Junction trên Windows để Live Sync khi git pull)
fs.readdirSync(srcSkillsDir).forEach(skillName => {
  const src = path.join(srcSkillsDir, skillName);
  const dest = path.join(targetSkillsDir, skillName);

  // Xóa đích cũ nếu tồn tại
  if (fs.existsSync(dest)) {
    try {
      if (process.platform === 'win32') {
        execSync(`cmd /c rmdir "${dest}"`, { stdio: 'ignore' });
      } else {
        fs.rmSync(dest, { recursive: true, force: true });
      }
    } catch (e) {
      try { fs.rmSync(dest, { recursive: true, force: true }); } catch {}
    }
  }

  try {
    if (process.platform === 'win32') {
      // Dùng Junction trên Windows (không cần quyền Admin, Live Sync tự động)
      execSync(`cmd /c mklink /J "${dest}" "${src}"`, { stdio: 'ignore' });
      console.log(`  🔗 [Live Link] Đã liên kết junction skill: ${skillName}`);
    } else {
      // Dùng Symlink trên macOS / Linux
      fs.symlinkSync(src, dest, 'dir');
      console.log(`  🔗 [Live Link] Đã liên kết symlink skill: ${skillName}`);
    }
  } catch (err) {
    // Fallback copy nếu môi trường hạn chế symlink
    fs.cpSync(src, dest, { recursive: true });
    console.log(`  📋 [Copy Fallback] Đã copy skill: ${skillName}`);
  }
});

// 2. LIÊN KẾT RULES
fs.readdirSync(srcRulesDir).forEach(ruleFile => {
  const src = path.join(srcRulesDir, ruleFile);
  const dest = path.join(targetRulesDir, ruleFile);

  if (fs.existsSync(dest)) fs.rmSync(dest, { force: true });

  try {
    if (process.platform === 'win32') {
      fs.linkSync(src, dest); // Hard link file trên Windows
      console.log(`  🔗 [Live Link] Đã liên kết rule: ${ruleFile}`);
    } else {
      fs.symlinkSync(src, dest);
      console.log(`  🔗 [Live Link] Đã liên kết rule: ${ruleFile}`);
    }
  } catch (err) {
    fs.copyFileSync(src, dest);
    console.log(`  📋 [Copy Fallback] Đã copy rule: ${ruleFile}`);
  }
});

console.log('\n🎉 Cài đặt hoàn tất!');
console.log('💡 TIP: Nhờ cơ chế Live Link (Junction), từ nay mỗi khi bạn `git pull`, toàn bộ Agent sẽ tự động cập nhật ngay mà KHÔNG CẦN chạy lại install!');
