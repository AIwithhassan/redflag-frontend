import subprocess
import sys
import os

test_dir = os.path.dirname(os.path.abspath(__file__))
tests = [
    "TC002_Open_the_playground_from_the_home_page.py",
    "TC007_Explore_the_home_page_and_reach_a_product_destination.py",
    "TC008_Open_configuration_from_the_playground_sidebar.py",
    "TC008_Switch_from_Playground_to_Configuration.py",
    "TC010_Navigate_between_the_main_landing_page_sections.py",
    "TC013_Review_provider_settings_before_editing.py",
]

failures = []

for test in tests:
    path = os.path.join(test_dir, test)
    print(f"\n{'='*60}")
    print(f"Running: {test}")
    print(f"{'='*60}")
    result = subprocess.run([sys.executable, path], capture_output=False)
    if result.returncode != 0:
        failures.append(test)
        print(f"FAILED: {test} (exit code {result.returncode})")
    else:
        print(f"PASSED: {test}")

if failures:
    print(f"\n{len(failures)} test(s) failed: {', '.join(failures)}")
    sys.exit(1)
else:
    print(f"\nAll {len(tests)} tests passed!")
    sys.exit(0)
