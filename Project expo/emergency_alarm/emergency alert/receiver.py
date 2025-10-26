import socket

HOST = '0.0.0.0'
PORT = 5050

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind((HOST, PORT))
server.listen(1)
print("🚑 Waiting for alerts...")

conn, addr = server.accept()
print(f"✅ Connected from {addr}")

try:
    while True:
        data = conn.recv(1024).decode().strip()
        if not data:
            break

        if data == "NORMAL":
            print("👋 Normal case detected – Proceed as usual.")
        elif data == "MODERATE":
            print("⚠️ Moderate case – Visit Emergency Ward / Casualty.")
        elif data == "EMERGENCY":
            print("🚨 Emergency Alert – Immediate response needed at entrance!")

finally:
    conn.close()
    server.close()
