"""
Automated Screenshot Capture Script for Next.js Application (Light Mode)
Captures:
  1. Input & Role Selection screen
  2. Gap Summary cards/charts & What-If simulator
  3. Requirement-Level Explainability Table (Exact / Semantic badges)
  4. Prioritized Learning Roadmap
  5. Saved History page
"""

import os
import time
import shutil
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

SCREENSHOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs", "screenshots"))
BRAIN_DIR = r"C:\Users\sarth\.gemini\antigravity\brain\d4c6f4be-1fdc-42da-bbea-7eff421f7d19"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)


def capture_all():
    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--window-size=1440,950")
    chrome_options.add_argument("--force-device-scale-factor=1")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")

    print("[1/5] Launching headless Chrome...")
    driver = webdriver.Chrome(options=chrome_options)
    wait = WebDriverWait(driver, 15)

    try:
        # -------------------------------------------------------------
        # Screen 1: Input & Role Selection screen
        # -------------------------------------------------------------
        print("[2/5] Navigating to http://localhost:3000...")
        driver.get("http://localhost:3000")
        time.sleep(2)

        # Scroll slightly to show Hero + Persona Cards + Role Selector nicely
        driver.execute_script("window.scrollTo(0, 160);")
        time.sleep(1)

        file1 = os.path.join(SCREENSHOT_DIR, "01_input_role_selection.png")
        driver.save_screenshot(file1)
        print(f"  -> Captured: {file1}")

        # -------------------------------------------------------------
        # Execute Analysis for Alex Johnson (Backend Developer)
        # -------------------------------------------------------------
        print("  Selecting Alex Johnson persona and executing analysis...")
        persona_btn = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Alex Johnson')]"))
        )
        persona_btn.click()
        time.sleep(1)

        submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_btn.click()

        print("  Waiting for deterministic skill gap analysis to complete...")
        wait.until(EC.presence_of_element_located((By.ID, "analysis-results")))
        time.sleep(3)  # Allow Recharts radar & gauge animations to settle

        # -------------------------------------------------------------
        # Screen 2: Gap Summary cards/charts & What-If Simulator
        # -------------------------------------------------------------
        print("[3/5] Capturing Gap Summary cards and charts...")
        driver.execute_script("window.scrollTo(0, 680);")
        time.sleep(1.5)

        file2 = os.path.join(SCREENSHOT_DIR, "02_gap_summary_cards.png")
        driver.save_screenshot(file2)
        print(f"  -> Captured: {file2}")

        # -------------------------------------------------------------
        # Screen 3: Requirement-Level Explainability Table
        # -------------------------------------------------------------
        print("[4/5] Capturing Requirement-Level Explainability Table...")
        # Scroll to table and ensure exact/semantic badges are in view
        driver.execute_script("""
            const el = document.querySelector('table');
            if (el) {
                el.scrollIntoView({ behavior: 'instant', block: 'center' });
            }
        """)
        time.sleep(1.5)

        file3 = os.path.join(SCREENSHOT_DIR, "03_evidence_explainability_table.png")
        driver.save_screenshot(file3)
        print(f"  -> Captured: {file3}")

        # -------------------------------------------------------------
        # Screen 4: Prioritized Learning Roadmap
        # -------------------------------------------------------------
        print("[5/5] Capturing Prioritized Learning Roadmap...")
        # Scroll to roadmap
        driver.execute_script("""
            const headings = Array.from(document.querySelectorAll('h3, h2'));
            const roadmapHeading = headings.find(h => h.textContent.includes('Learning Roadmap') || h.textContent.includes('Phase 1'));
            if (roadmapHeading) {
                roadmapHeading.scrollIntoView({ behavior: 'instant', block: 'start' });
                window.scrollBy(0, -60);
            } else {
                window.scrollTo(0, document.body.scrollHeight - 1200);
            }
        """)
        time.sleep(1.5)

        file4 = os.path.join(SCREENSHOT_DIR, "04_learning_roadmap.png")
        driver.save_screenshot(file4)
        print(f"  -> Captured: {file4}")

        # -------------------------------------------------------------
        # Screen 5: Saved History Page
        # -------------------------------------------------------------
        print("[Bonus/5] Navigating to http://localhost:3000/history...")
        driver.get("http://localhost:3000/history")
        time.sleep(2.5)

        file5 = os.path.join(SCREENSHOT_DIR, "05_saved_history_page.png")
        driver.save_screenshot(file5)
        print(f"  -> Captured: {file5}")

        # Copy all screenshots to the artifact directory
        if os.path.exists(BRAIN_DIR):
            for fname in ["01_input_role_selection.png", "02_gap_summary_cards.png", "03_evidence_explainability_table.png", "04_learning_roadmap.png", "05_saved_history_page.png"]:
                src = os.path.join(SCREENSHOT_DIR, fname)
                dst = os.path.join(BRAIN_DIR, fname)
                shutil.copy2(src, dst)
                print(f"  [Copied to Brain Artifacts] {fname}")

        print("\nAll 5 application screenshots captured successfully!")

    finally:
        driver.quit()


if __name__ == "__main__":
    capture_all()
