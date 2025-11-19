"""
Test Document Service - Unit Tests for PDF Generation
"""
import datetime
import sys
import os

# Add parent directory to path to allow imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.document_service import DocumentService


def test_generate_medical_certificate():
    """Test medical certificate generation"""
    service = DocumentService()

    pdf_buffer = service.generate_medical_certificate(
        patient_name="João Silva",
        doctor_name="Dr. Maria Santos",
        doctor_crm="123456-SP",
        icd_code="J00",
        icd_description="Nasofaringite aguda (resfriado comum)",
        days_off=3,
        start_date=datetime.date.today()
    )

    # Verify PDF was generated
    assert pdf_buffer is not None
    assert pdf_buffer.tell() == 0  # Buffer should be at start

    # Verify PDF content starts with PDF header
    content = pdf_buffer.read(4)
    assert content == b'%PDF', "Should start with PDF header"

    print("✅ Medical certificate generation test passed!")
    return pdf_buffer


def test_generate_prescription():
    """Test prescription generation"""
    service = DocumentService()

    medications = [
        {
            "name": "Paracetamol 500mg",
            "dosage": "1 comprimido",
            "frequency": "a cada 8 horas",
            "duration": "5 dias"
        },
        {
            "name": "Dipirona 500mg",
            "dosage": "20 gotas",
            "frequency": "a cada 6 horas se dor",
            "duration": "7 dias"
        }
    ]

    pdf_buffer = service.generate_prescription(
        patient_name="Maria Oliveira",
        patient_age=45,
        doctor_name="Dr. Carlos Eduardo",
        doctor_crm="789012-RJ",
        medications=medications
    )

    # Verify PDF was generated
    assert pdf_buffer is not None
    assert pdf_buffer.tell() == 0

    # Verify PDF content
    content = pdf_buffer.read(4)
    assert content == b'%PDF', "Should start with PDF header"

    print("✅ Prescription generation test passed!")
    return pdf_buffer


def test_generate_attendance_declaration():
    """Test attendance declaration generation"""
    service = DocumentService()

    pdf_buffer = service.generate_attendance_declaration(
        patient_name="Pedro Costa",
        doctor_name="Dr. Ana Paula",
        doctor_crm="345678-MG",
        consultation_date=datetime.date.today(),
        start_time="14:00",
        end_time="15:30"
    )

    # Verify PDF was generated
    assert pdf_buffer is not None
    assert pdf_buffer.tell() == 0

    # Verify PDF content
    content = pdf_buffer.read(4)
    assert content == b'%PDF', "Should start with PDF header"

    print("✅ Attendance declaration generation test passed!")
    return pdf_buffer


def save_sample_pdfs():
    """Generate and save sample PDFs for manual inspection"""
    print("\n📄 Generating sample PDFs...")

    # Create samples directory
    samples_dir = os.path.join(os.path.dirname(__file__), 'samples')
    os.makedirs(samples_dir, exist_ok=True)

    # Generate medical certificate
    cert_buffer = test_generate_medical_certificate()
    cert_buffer.seek(0)
    with open(os.path.join(samples_dir, 'atestado_sample.pdf'), 'wb') as f:
        f.write(cert_buffer.read())
    print(f"   → atestado_sample.pdf saved")

    # Generate prescription
    pres_buffer = test_generate_prescription()
    pres_buffer.seek(0)
    with open(os.path.join(samples_dir, 'receita_sample.pdf'), 'wb') as f:
        f.write(pres_buffer.read())
    print(f"   → receita_sample.pdf saved")

    # Generate declaration
    decl_buffer = test_generate_attendance_declaration()
    decl_buffer.seek(0)
    with open(os.path.join(samples_dir, 'declaracao_sample.pdf'), 'wb') as f:
        f.write(decl_buffer.read())
    print(f"   → declaracao_sample.pdf saved")

    print(f"\n✅ All sample PDFs saved to: {samples_dir}")


if __name__ == "__main__":
    print("🧪 Running Document Service Tests...\n")

    try:
        test_generate_medical_certificate()
        test_generate_prescription()
        test_generate_attendance_declaration()

        print("\n" + "="*50)
        print("✅ All tests passed!")
        print("="*50)

        # Generate sample PDFs
        save_sample_pdfs()

    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
