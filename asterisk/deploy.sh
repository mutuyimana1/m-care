#!/bin/bash
# Run with: sudo bash /opt/lampp/htdocs/care/asterisk/deploy.sh
set -e

CARE_DIR="/opt/lampp/htdocs/care"
AST_DIR="/etc/asterisk"
AGI_DIR="/usr/share/asterisk/agi-bin"
LAN_IP="192.168.1.106"

# ── 1. AGI script ────────────────────────────────────────────────────────────
cp "$CARE_DIR/asterisk/agi/mcare_ivr.php" "$AGI_DIR/mcare_ivr.php"
chmod 755 "$AGI_DIR/mcare_ivr.php"
chown asterisk:asterisk "$AGI_DIR/mcare_ivr.php"

# ── 2. PJSIP transport + users ───────────────────────────────────────────────
cat > "$AST_DIR/pjsip_mcare.conf" << 'PJSIP'
[transport-udp]
type=transport
protocol=udp
bind=0.0.0.0:5060

[auth_1001]
type=auth
auth_type=userpass
username=1001
password=CHANGE-THIS-LOCAL-1001!

[aor_1001]
type=aor
max_contacts=2
remove_existing=yes
qualify_frequency=30

[1001]
type=endpoint
transport=transport-udp
context=mcare-ivr
disallow=all
allow=ulaw
allow=alaw
auth=auth_1001
aors=aor_1001
direct_media=no
rtp_symmetric=yes
force_rport=yes
rewrite_contact=yes

[auth_1002]
type=auth
auth_type=userpass
username=1002
password=CHANGE-THIS-LOCAL-1002!

[aor_1002]
type=aor
max_contacts=2
remove_existing=yes
qualify_frequency=30

[1002]
type=endpoint
transport=transport-udp
context=mcare-ivr
disallow=all
allow=ulaw
allow=alaw
auth=auth_1002
aors=aor_1002
direct_media=no
rtp_symmetric=yes
force_rport=yes
rewrite_contact=yes
PJSIP

chown asterisk:asterisk "$AST_DIR/pjsip_mcare.conf"
chmod 640 "$AST_DIR/pjsip_mcare.conf"

# ── 3. Include pjsip_mcare.conf from pjsip.conf ──────────────────────────────
if ! grep -q "pjsip_mcare.conf" "$AST_DIR/pjsip.conf"; then
    echo "" >> "$AST_DIR/pjsip.conf"
    echo "#include \"pjsip_mcare.conf\"" >> "$AST_DIR/pjsip.conf"
fi

# ── 4. Dialplan ──────────────────────────────────────────────────────────────
cat > "$AST_DIR/extensions_mcare.conf" << 'DIALPLAN'
[mcare-ivr]
exten => 700,1,NoOp(M-CARE IVR)
 same => n,Answer()
 same => n,AGI(mcare_ivr.php)
 same => n,Hangup()
DIALPLAN

chown asterisk:asterisk "$AST_DIR/extensions_mcare.conf"
chmod 640 "$AST_DIR/extensions_mcare.conf"

# ── 5. Include dialplan from extensions.conf ─────────────────────────────────
if ! grep -q "extensions_mcare.conf" "$AST_DIR/extensions.conf"; then
    echo "" >> "$AST_DIR/extensions.conf"
    echo "#include \"extensions_mcare.conf\"" >> "$AST_DIR/extensions.conf"
fi

# ── 6. Reload Asterisk ───────────────────────────────────────────────────────
asterisk -rx "core reload"
sleep 2
echo ""
echo "=== Transports ==="
asterisk -rx "pjsip show transports"
echo ""
echo "=== Endpoints ==="
asterisk -rx "pjsip show endpoints"
echo ""
echo "Done. Connect Zoiper/Linphone to:"
echo "  Server : $LAN_IP"
echo "  Port   : 5060"
echo "  User   : 1001   Password: CHANGE-THIS-LOCAL-1001!"
echo "  User   : 1002   Password: CHANGE-THIS-LOCAL-1002!"
echo "  Dial   : 700  to reach the IVR"
