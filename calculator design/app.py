from flask import Flask, render_template, request, jsonify
import math

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input"}), 400

    expression = data.get('expression', '')
    operation = data.get('operation', '')

    try:
        if operation == 'sqrt':
            val = float(expression)
            if val < 0:
                return jsonify({"error": "Cannot take square root of negative number"}), 400
            result = math.sqrt(val)
        elif operation == 'square':
            val = float(expression)
            result = val ** 2
        elif operation == 'percent':
            # Assuming percentage is x / 100
            val = float(expression)
            result = val / 100
        else:
            # Safely evaluate simple arithmetic expressions
            # Using eval with limited globals for safety (though for a calculator app, we could also use a safer parser)
            # We'll allow numbers and basic operators.
            allowed_chars = "0123456789+-*/.() "
            if not all(char in allowed_chars for char in expression):
                return jsonify({"error": "Invalid characters in expression"}), 400
            
            # Use eval carefully (real-world app should use a proper expression parser like `simpleeval`)
            result = eval(expression, {"__builtins__": None}, {})
            
        # Format result to avoid very long decimals
        if isinstance(result, float) and result.is_integer():
            result = int(result)
        elif isinstance(result, float):
            result = round(result, 8)

        return jsonify({"result": result})
    except ZeroDivisionError:
        return jsonify({"error": "Cannot divide by zero"}), 400
    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 400

if __name__ == '__main__':
    app.run(debug=True)
