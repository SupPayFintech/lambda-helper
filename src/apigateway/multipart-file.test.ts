import parse from './multipart-file';

describe('Parse function', () => {
  it('should parse the multipart form-data successfully given raw multipart form data', async () => {
    const event = {
      headers: {
        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryDP6Z1qHQSzB6Pf8c',
      },
      body: [
        '------WebKitFormBoundaryDP6Z1qHQSzB6Pf8c',
        'Content-Disposition: form-data; name="uploadFile1"; filename="test.txt"',
        'Content-Type: text/plain',
        '',
        'Hello World!',
        '------WebKitFormBoundaryDP6Z1qHQSzB6Pf8c--',
      ].join('\r\n'),
      isBase64Encoded: false,
    } as any;

    await expect(parse(event)).resolves.toEqual({
      files: [
        {
          content: Buffer.from('Hello World!'),
          contentType: undefined,
          encoding: undefined,
          fieldname: 'uploadFile1',
          filename: { encoding: '7bit', filename: 'test.txt', mimeType: 'text/plain' },
        },
      ],
    });
  });

  it('should parse the multipart form-data successfully given base64 encoded form data', async () => {
    const event = {
      headers: {
        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryDP6Z1qHQSzB6Pf8c',
      },
      body: `LS0tLS0tV2ViS2l0Rm9ybUJvdW5kYXJ5RFA2WjFxSFFTekI2UGY4Yw0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJ1cGxvYWRGaWxlMSI7IGZpb
                        GVuYW1lPSJ0ZXN0LnR4dCINCkNvbnRlbnQtVHlwZTogdGV4dC9wbGFpbg0KDQpIZWxsbyBXb3JsZCENCi0tLS0tLVdlYktpdEZvcm1Cb3VuZGFyeURQNloxcUhRU3pCNl
                        BmOGMNCkNvbnRlbnQtRGlzcG9zaXRpb246IGZvcm0tZGF0YTsgbmFtZT0idXBsb2FkRmlsZTIiOyBmaWxlbmFtZT0iIg0KQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9
                        vY3RldC1zdHJlYW0NCg0KDQotLS0tLS1XZWJLaXRGb3JtQm91bmRhcnlEUDZaMXFIUVN6QjZQZjhjLS0NCg==`,
      isBase64Encoded: true,
    } as any;

    const result = await parse(event);

    const extractfields = result.files.map(({ contentType, encoding, fieldname, filename }) => ({
      contentType,
      encoding,
      fieldname,
      filename,
    }));

    expect(extractfields).toEqual([
      {
        contentType: undefined,
        encoding: undefined,
        fieldname: 'uploadFile1',
        filename: { encoding: '7bit', filename: 'test.txt', mimeType: 'text/plain' },
      },
      {
        contentType: undefined,
        encoding: undefined,
        fieldname: 'uploadFile2',
        filename: { encoding: '7bit', filename: undefined, mimeType: 'application/octet-stream' },
      },
    ]);
  });
});
