import * as Scrapper from '../../main/services/scrapper'

test('Extracting the DOM from the browser window', async() =>{
    const mockWebContents = {
        executeJavaScript: jest.fn().mockResolvedValue('<html><body>Test</body></html>')
    };

    const mockWindow = {
        webContents: mockWebContents
    } as any;

    const dom = await Scrapper.extractDOM(mockWindow);
    expect(dom).toBe('<html><body>Test</body></html>');
    expect(mockWebContents.executeJavaScript).toHaveBeenCalledWith('document.documentElement.outerHTML', true);
})