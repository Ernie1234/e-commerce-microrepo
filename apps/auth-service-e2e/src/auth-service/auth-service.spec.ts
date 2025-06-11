import axios from 'axios';

describe('GET /', () => {
  it('should return a message', async () => {
    try {
      const res = await axios.get(`/`);

      expect(res.status).toBe(200);
      expect(res.data).toEqual({ message: 'Welcome auth API' });
    } catch (error: any) {
      // Use 'any' for simpler error handling if AxiosError type not fully imported
      console.error('Test failed for GET /:', error.message);
      if (error.response) {
        console.error('Response Status:', error.response.status);
        console.error('Response Data:', error.response.data);
      }
      throw error; // Re-throw to ensure the test fails
    }
  });
});
