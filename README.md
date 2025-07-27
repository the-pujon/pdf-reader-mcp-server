# PDF Reader MCP Server

A Model Context Protocol (MCP) server that enables AI assistants like Cursor to read, search, and analyze PDF documents directly within your development environment.

## Features

- 📄 **Full PDF Text Extraction** - Access complete document content
- 🔍 **Intelligent Search** - Find text with contextual previews
- 📊 **Document Metadata** - Get page counts, word counts, and PDF info
- ✂️ **Excerpt Extraction** - Extract specific text ranges
- 🚀 **Fast Performance** - Loads once, queries instantly
- 🔌 **MCP Integration** - Seamless integration with Cursor IDE

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Cursor IDE with MCP support

## Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd pdf-mcp-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Place your PDF file**
   - Put your PDF in the project directory and name it `document.pdf`, OR
   - Set the `PDF_PATH` environment variable to point to your PDF file

## Configuration

### Method 1: Environment Variable
```bash
# Windows
set PDF_PATH=C:\path\to\your\document.pdf

# macOS/Linux
export PDF_PATH=/path/to/your/document.pdf
```

### Method 2: Edit the Code
Update the `PDF_PATH` variable in `server.js`:
```javascript
const PDF_PATH = path.join(__dirname, "your-document.pdf");
```

## Usage

### Running the Server
```bash
npm start
# or
node server.js
```

### Configuring Cursor IDE

Add the server to your Cursor MCP configuration. The location varies by OS:

- **Windows**: `%APPDATA%\Cursor\User\globalSettings\settings.json`
- **macOS**: `~/Library/Application Support/Cursor/User/globalSettings/settings.json`
- **Linux**: `~/.config/Cursor/User/globalSettings/settings.json`

Add this configuration:
```json
{
  "mcp": {
    "servers": {
      "pdf-reader": {
        "command": "node",
        "args": ["path/to/your/pdf-mcp-server/server.js"],
        "env": {
          "PDF_PATH": "path/to/your/document.pdf"
        }
      }
    }
  }
}
```

## Available Tools

### `get_pdf_content`
Get the complete text content of the loaded PDF document.

**Parameters:** None

**Example:**
```
Please show me the content of the PDF document.
```

### `search_pdf`
Search for specific text within the PDF document.

**Parameters:**
- `query` (required): Text to search for
- `case_sensitive` (optional): Whether to perform case-sensitive search (default: false)

**Example:**
```
Search for "machine learning" in the PDF document.
```

### `get_pdf_info`
Get metadata and information about the loaded PDF.

**Parameters:** None

**Example:**
```
What information can you tell me about this PDF?
```

### `get_pdf_excerpt`
Extract a specific portion of the PDF by character range.

**Parameters:**
- `start` (required): Starting character position
- `length` (optional): Number of characters to extract (default: 1000)

**Example:**
```
Get an excerpt from the PDF starting at character position 1500.
```

## Available Resources

### `pdf://document`
Direct access to the PDF content as a resource that can be referenced by the AI assistant.

## Example Interactions

Once configured, you can interact with your PDF through Cursor's AI assistant:

- *"What is this document about?"*
- *"Search for any mentions of 'API authentication' in the PDF"*
- *"Summarize the section about database design"*
- *"Find all code examples in the document"*
- *"What are the main topics covered in this PDF?"*

## Troubleshooting

### PDF Not Found Error
```
PDF file not found at: /path/to/document.pdf
```
**Solution:** Ensure the PDF file exists at the specified path or update the `PDF_PATH` variable.

### Server Won't Start
```
Failed to start server: Error message
```
**Solutions:**
- Check that Node.js version is 18 or higher
- Ensure all dependencies are installed: `npm install`
- Verify the PDF file is readable

### Cursor Not Detecting Server
**Solutions:**
- Restart Cursor IDE after adding the MCP configuration
- Check that the server path in the configuration is correct
- Verify the server starts without errors when run manually

## Development

### Project Structure
```
pdf-mcp-server/
├── server.js          # Main MCP server implementation
├── package.json       # Node.js dependencies and scripts
├── README.md          # This file
└── pdf/document.pdf       # Your PDF file (not included)
```

### Dependencies
- `@modelcontextprotocol/sdk` - MCP TypeScript SDK
- `pdf-parse` - PDF text extraction
- `zod` - Schema validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with different PDF files
5. Submit a pull request

## Future Enhancements

- [ ] Support for multiple PDF files
- [ ] Page-by-page navigation
- [ ] OCR support for scanned PDFs
- [ ] Table extraction
- [ ] Image description
- [ ] Bookmark and outline parsing
- [ ] Password-protected PDF support

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Built with the [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- PDF parsing powered by [pdf-parse](https://www.npmjs.com/package/pdf-parse)
- Designed for [Cursor IDE](https://cursor.sh/)

---

**Need help?** Open an issue or reach out with questions about setup and usage.