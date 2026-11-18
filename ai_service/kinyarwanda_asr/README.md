# M-CARE Kinyarwanda voice transcription

This folder contains a local copy of the Kinyarwanda ASR model and its M-CARE transcription service. The model files were copied from the Hugging Face cache in the local `rba` project for model `badrex/w2v-bert-2.0-kinyarwanda-asr` (CC-BY-4.0). The downloaded model is about 2.2 GB on disk. See the [upstream model card](https://huggingface.co/badrex/w2v-bert-2.0-kinyarwanda-asr) for attribution and terms.

The model card reports in-domain WER below 8.4%, but warns about accent/audio variation and says high-stakes use requires domain-specific validation. M-CARE therefore treats the output as a draft transcription: the mother can review and correct it before submission. It is not clinical NLP, translation, diagnosis, or triage. Audio is held in request memory/temp upload handling only and is not saved as a recording by this service.

## Install and run

Use a separate virtual environment for the optional ASR dependencies. On a CPU-only machine, from the project root:

```sh
python3 -m venv ai_service/.venv-asr
ai_service/.venv-asr/bin/pip install 'torch==2.7.1+cpu' --index-url https://download.pytorch.org/whl/cpu
ai_service/.venv-asr/bin/pip install -r ai_service/requirements.txt -r ai_service/kinyarwanda_asr/requirements-asr.txt 'transformers>=4.50,<5' 'numpy>=1.26,<2'
```

The app's root `.htaccess` must define `MCARE_ASR_SERVICE_URL=http://127.0.0.1:8101` and a private `MCARE_ASR_SERVICE_TOKEN`. Apache passes these settings to PHP; the launcher reads the same token from `.htaccess` and binds the model service to localhost. Start it from the project root with:

```sh
./ai_service/start_kinyarwanda_asr.sh
```

The launcher runs the service as a per-user systemd unit. Run it again after logging back in or restarting the computer. View service logs with `journalctl --user -u mcare-kinyarwanda-asr.service`. The token is not sent to browser JavaScript.

The mother report form records a short Kinyarwanda voice note, converts it to WAV in the browser, and posts it to the authenticated PHP proxy. The proxy forwards it to `/v1/transcribe`; the model loads locally on the first request. Supported uploads are WAV/FLAC, limited to 25 MB and 120 seconds. Keep the ASR service bound to localhost or another private interface. Do not expose its token to browser JavaScript.

Hardware note: loading the roughly 600M-parameter model requires several GB of RAM and inference can take time on CPU. First-use model loading is lazy. If voice transcription is unavailable, the form still supports typed symptom reports.
