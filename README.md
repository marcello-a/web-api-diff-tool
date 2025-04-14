# Web API Diff Tool

A Node.js tool designed to compare responses from two API endpoints, particularly useful for comparing product configurations. It supports large datasets and ensures efficient memory usage while identifying differences between API responses.

## Features

- **API Response Comparison**: Compare two API responses and highlight differences.
- **Configurable Property Comparison**: Specify which properties to compare.
- **Chunk-Based Processing**: Efficient handling of large datasets by breaking them into chunks.
- **Memory-Efficient**: Optimized for handling large datasets without overwhelming memory.
- **JSON Output**: Generate detailed JSON files outlining the differences.
  
## Installation

### Requirements

- **Node.js** 18 or higher
- **pnpm** package manager

### Steps to Install

1. Clone the repository:
   ```bash
   git clone https://github.com/marcello-a/web-api-diff-tool.git
   cd web-api-diff-tool
   ```

2. Install dependencies using pnpm:
   ```bash
   pnpm install
   ```

## Usage

1. **Configure the API Endpoints**: Update the API endpoint URLs in the configuration file (`config.ts`).
   
2. **Run the Comparison**: Execute the script to fetch and compare data from the two API endpoints:
   ```bash
   pnpm run compare
   ```

3. **View the Output**: The tool will generate JSON files containing the differences, which can be found in the `output` directory.

### Output Files
The tool generates three files in the `output` directory:
- **response1_[timestamp].json**: Contains the response data from the first API.
- **response2_[timestamp].json**: Contains the response data from the second API.
- **differences_[timestamp].json**: Contains the differences between the two API responses.

Each difference entry includes:
- **index**: Position of the entry in the dataset.
- **type**: Type of difference (`new`, `deleted`, `changed`).
- **left**: Value from the first API (if applicable).
- **right**: Value from the second API (if applicable).

## Configuration

### Chunk Size

The tool supports processing large datasets by dividing the data into chunks. You can adjust the chunk size in the `compare.ts` file to balance memory usage and performance:

```typescript
const CHUNK_SIZE = 1000; // Default chunk size
```

### Properties to Compare

Specify which properties should be compared between the two API responses. Modify the `PROPS_TO_COMPARE` constant in the `compare.ts` file:

```typescript
const PROPS_TO_COMPARE: string[] = ['property1', 'property2', ...];
```

## Example Output

The output file `differences_[timestamp].json` will look like this:

```json
{
  "timestamp": "2024-03-14T13:29:01.837Z",
  "totalDifferences": 16,
  "comparedProperties": ["printing", "cover", "coverLamination", "binding", "paper", "format"],
  "url1": "https://api.example.com/endpoint1",
  "url2": "https://api.example.com/endpoint2",
  "differences": [
    {
      "index": 0,
      "type": "changed",
      "left": {
        "printing": "value1",
        "cover": "value2"
      },
      "right": {
        "printing": "value3",
        "cover": "value4"
      }
    }
  ]
}
```

## License

This tool is licensed under the [MIT License](LICENSE).