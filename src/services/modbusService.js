
/**
 * GI SMART POND
 * Modbus RTU Service
 *
 * Phase 1:
 * - Read Digital Inputs (Function Code 02)
 * - CRC16 validation
 * - No Digital Output control
 *
 * Transport must provide an async exchange(frame, options)
 * method that returns the complete Modbus response frame.
 */

const FUNCTION_READ_DISCRETE_INPUTS = 0x02;
const DEFAULT_SLAVE_ID = 1;
const DEFAULT_TIMEOUT = 1500;

export function calculateCRC16(data) {
  let crc = 0xFFFF;

  for (const byte of data) {
    crc ^= byte;

    for (let bit = 0; bit < 8; bit++) {
      if (crc & 1) {
        crc = (crc >> 1) ^ 0xA001;
      } else {
        crc >>= 1;
      }
    }
  }

  return crc & 0xFFFF;
}

function appendCRC(data) {
  const crc = calculateCRC16(data);

  return Uint8Array.from([
    ...data,
    crc & 0xFF,
    (crc >> 8) & 0xFF
  ]);
}

function validateCRC(frame) {
  if (!(frame instanceof Uint8Array) || frame.length < 5) {
    return false;
  }

  const receivedCRC =
    frame[frame.length - 2] |
    (frame[frame.length - 1] << 8);

  const calculatedCRC = calculateCRC16(
    frame.slice(0, -2)
  );

  return receivedCRC === calculatedCRC;
}

function createReadRequest(slaveId, startAddress, quantity) {
  if (
    !Number.isInteger(slaveId) ||
    slaveId < 1 ||
    slaveId > 247
  ) {
    throw new RangeError('Invalid Modbus slave ID');
  }

  if (
    !Number.isInteger(startAddress) ||
    startAddress < 0 ||
    startAddress > 65535
  ) {
    throw new RangeError('Invalid input start address');
  }

  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 2000 ||
    startAddress + quantity > 65536
  ) {
    throw new RangeError('Invalid input quantity');
  }

  return appendCRC([
    slaveId,
    FUNCTION_READ_DISCRETE_INPUTS,
    (startAddress >> 8) & 0xFF,
    startAddress & 0xFF,
    (quantity >> 8) & 0xFF,
    quantity & 0xFF
  ]);
}

function parseReadResponse(
  frame,
  slaveId,
  expectedQuantity
) {
  if (!validateCRC(frame)) {
    throw new Error('Modbus CRC validation failed');
  }

  if (frame[0] !== slaveId) {
    throw new Error('Modbus slave ID mismatch');
  }

  if (frame[1] & 0x80) {
    throw new Error(
      `Modbus exception code: ${frame[2]}`
    );
  }

  if (frame[1] !== FUNCTION_READ_DISCRETE_INPUTS) {
    throw new Error('Unexpected Modbus function code');
  }

  const byteCount = frame[2];
  const expectedBytes = Math.ceil(expectedQuantity / 8);

  if (
    byteCount !== expectedBytes ||
    frame.length !== byteCount + 5
  ) {
    throw new Error('Invalid Modbus response length');
  }

  const inputs = [];

  for (let index = 0; index < expectedQuantity; index++) {
    const byteIndex = 3 + Math.floor(index / 8);
    const bitIndex = index % 8;

    inputs.push(
      Boolean((frame[byteIndex] >> bitIndex) & 1)
    );
  }

  return inputs;
}

export function createModbusService({
  transport,
  slaveId = DEFAULT_SLAVE_ID,
  timeoutMs = DEFAULT_TIMEOUT
} = {}) {
  if (!transport || typeof transport.exchange !== 'function') {
    throw new TypeError(
      'A Modbus transport with exchange() is required'
    );
  }

  async function readDiscreteInputs(
    startAddress = 0,
    quantity = 16
  ) {
    const request = createReadRequest(
      slaveId,
      startAddress,
      quantity
    );

    const response = await transport.exchange(
      request,
      { timeoutMs }
    );

    return parseReadResponse(
      response,
      slaveId,
      quantity
    );
  }

  return {
    readDiscreteInputs
  };
}
