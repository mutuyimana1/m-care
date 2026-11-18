#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
service_dir="$project_root/ai_service/kinyarwanda_asr"
python_bin="$project_root/ai_service/.venv-asr/bin/python"
uvicorn_bin="$project_root/ai_service/.venv-asr/bin/uvicorn"
service_token="$(sed -n 's/^SetEnv MCARE_ASR_SERVICE_TOKEN[[:space:]]\+//p' "$project_root/.htaccess" | tail -n 1)"

if [[ ! -x "$uvicorn_bin" || ! -x "$python_bin" ]]; then
  echo "ASR dependencies are not installed. See ai_service/kinyarwanda_asr/README.md."
  exit 1
fi
if [[ -z "$service_token" ]]; then
  echo "MCARE_ASR_SERVICE_TOKEN is missing from the protected Apache configuration."
  exit 1
fi
if systemctl --user is-active --quiet mcare-kinyarwanda-asr.service; then
  echo "Kinyarwanda transcription service is already running."
  exit 0
fi

systemd-run --user --unit=mcare-kinyarwanda-asr --description='M-CARE Kinyarwanda speech transcription' --property=Restart=on-failure --working-directory="$service_dir" --setenv="MCARE_ASR_SERVICE_TOKEN=$service_token" "$uvicorn_bin" server:app --host 127.0.0.1 --port 8101 >/dev/null
for attempt in {1..30}; do
  if curl --silent --fail --max-time 2 http://127.0.0.1:8101/health >/dev/null; then
    echo "Kinyarwanda transcription service is ready on localhost:8101."
    exit 0
  fi
  if ! systemctl --user is-active --quiet mcare-kinyarwanda-asr.service; then
    echo "ASR service did not start. Check: journalctl --user -u mcare-kinyarwanda-asr.service"
    exit 1
  fi
  sleep 1
done
echo "ASR service is still loading. Check ai_service/kinyarwanda-asr.log."
